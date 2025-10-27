import { supabase } from "@/lib/superbase"
import {
  GOOGLE_CLIENT_ID,
  SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_SECRET as GOOGLE_CLIENT_SECRET, 
  GOOGLE_REDIRECT_URI,
  COOKIE_NAME, // Giữ lại nếu bạn vẫn muốn set cookie session riêng (Cách 2)
  REFRESH_COOKIE_NAME, // Giữ lại nếu bạn vẫn muốn set cookie session riêng (Cách 2)
  COOKIE_MAX_AGE, // Giữ lại nếu bạn vẫn muốn set cookie session riêng (Cách 2)
  COOKIE_OPTIONS, // Giữ lại nếu bạn vẫn muốn set cookie session riêng (Cách 2)
  REFRESH_COOKIE_OPTIONS, // Giữ lại nếu bạn vẫn muốn set cookie session riêng (Cách 2)
} from "@/utils/constants";
// Bỏ import jose và các hằng số JWT không dùng nữa (JWT_EXPIRATION_TIME, JWT_SECRET, REFRESH_TOKEN_EXPIRY) nếu dùng Cách 1

export async function POST(request: Request) {
  const body = await request.formData();
  const code = body.get("code") as string;
  const platform = (body.get("platform") as string) || "native";

  if (!code) {
    return Response.json(
      { error: "Missing authorization code" },
      { status: 400 }
    );
  }

  // --- Bước 1: Trao đổi code lấy id_token từ Google ---
  const googleTokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID, // Lấy từ file PDF/Google Console
      client_secret: GOOGLE_CLIENT_SECRET, // Đảm bảo tên biến môi trường là GOOGLE_CLIENT_SECRET
      redirect_uri: GOOGLE_REDIRECT_URI, // Phải khớp với cấu hình Google Console
      grant_type: "authorization_code",
      code: code,
    }),
  });

  const googleData = await googleTokenResponse.json();

  // Kiểm tra lỗi từ Google
  if (googleData.error) {
    console.error("Google Token Exchange Error:", googleData);
    return Response.json(
      {
        error: googleData.error,
        error_description: googleData.error_description,
        message:
          "Google OAuth token exchange failed. Check server logs and Google Console config.",
      },
      {
        status: 400,
      }
    );
  }

  if (!googleData.id_token) {
    console.error("Missing id_token from Google:", googleData);
    return Response.json(
      { error: "Missing id_token from Google response" },
      { status: 400 }
    );
  }

  // --- Bước 2: Dùng id_token để đăng nhập vào Supabase ---
  try {
    const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: googleData.id_token, // Sử dụng id_token nhận được từ Google
    });

    if (supabaseError) {
      console.error("Supabase signInWithIdToken Error:", supabaseError);
      throw supabaseError; // Ném lỗi để block catch xử lý
    }

    if (!supabaseData.session) {
       console.error("No session returned from Supabase despite successful signInWithIdToken");
       return Response.json({ error: "Supabase session creation failed" }, { status: 500 });
    }

    // --- Bước 3: Xử lý kết quả và trả về cho client ---

    // **Cách 1: Trả về Supabase Session (Khuyến nghị cho Supabase)**
    if (platform === "web") {
      // Supabase client JS thường tự quản lý session/cookie khi chạy ở môi trường server/edge.
      // Bạn chỉ cần trả về thông tin user hoặc session nếu cần.
      // Hoặc nếu bạn muốn set cookie session HTTP-Only thủ công (an toàn hơn):
      const { access_token, refresh_token, expires_at } = supabaseData.session;
      const response = Response.json({
         success: true,
         user: supabaseData.user // Trả về thông tin user nếu cần
      });
       // Ví dụ set cookie session (điều chỉnh maxAge, path, secure, httpOnly, sameSite theo nhu cầu)
       // Lưu ý: Quản lý session bằng cookie cần logic refresh và logout riêng.
       // response.headers.set('Set-Cookie', `sb-access-token=${access_token}; Path=/; Max-Age=${expires_at ? expires_at - Math.floor(Date.now()/1000) : 3600}; HttpOnly; Secure; SameSite=Lax`);
       // response.headers.append('Set-Cookie', `sb-refresh-token=${refresh_token}; Path=/; Max-Age=604800; HttpOnly; Secure; SameSite=Lax`);
      return response;

    } else { // Native
       // Trả về session đầy đủ cho client native
       // Supabase client library trên native sẽ tự xử lý lưu trữ an toàn
       return Response.json(supabaseData.session);
    }

    /*
    // **Cách 2: Tạo JWT tùy chỉnh (Giống ví dụ gốc, bỏ comment nếu muốn dùng cách này)**
    const userInfo = supabaseData.user; // Hoặc lấy từ supabaseData.session nếu cần
    if (!userInfo) {
       return Response.json({ error: "User info not found in Supabase response" }, { status: 500 });
    }
    const sub = userInfo.id; // Lấy ID người dùng từ Supabase
    const issuedAt = Math.floor(Date.now() / 1000);
    const jti = crypto.randomUUID();

    // Tạo access token tùy chỉnh
    const accessToken = await new jose.SignJWT({ ...userInfo.user_metadata, email: userInfo.email }) // Lấy thông tin cần thiết
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(JWT_EXPIRATION_TIME)
      .setSubject(sub)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_SECRET)); // Dùng JWT_SECRET của bạn

    // Tạo refresh token tùy chỉnh
    const refreshToken = await new jose.SignJWT({ sub, jti, type: "refresh", ...userInfo.user_metadata, email: userInfo.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(REFRESH_TOKEN_EXPIRY)
      .setIssuedAt(issuedAt)
      .sign(new TextEncoder().encode(JWT_REFRESH_SECRET || JWT_SECRET)); // Nên dùng secret riêng cho refresh token

    if (platform === "web") {
      const response = Response.json({ success: true, issuedAt: issuedAt, expiresAt: issuedAt + COOKIE_MAX_AGE });
      response.headers.set(
        "Set-Cookie",
        `${COOKIE_NAME}=${accessToken}; Max-Age=${COOKIE_OPTIONS.maxAge}; Path=${COOKIE_OPTIONS.path}; ${COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""} ${COOKIE_OPTIONS.secure ? "Secure;" : ""} SameSite=${COOKIE_OPTIONS.sameSite}`
      );
      response.headers.append(
        "Set-Cookie",
        `${REFRESH_COOKIE_NAME}=${refreshToken}; Max-Age=${REFRESH_COOKIE_OPTIONS.maxAge}; Path=${REFRESH_COOKIE_OPTIONS.path}; ${REFRESH_COOKIE_OPTIONS.httpOnly ? "HttpOnly;" : ""} ${REFRESH_COOKIE_OPTIONS.secure ? "Secure;" : ""} SameSite=${REFRESH_COOKIE_OPTIONS.sameSite}`
      );
      return response;
    } else { // Native
      return Response.json({ accessToken, refreshToken });
    }
    */

  } catch (error: any) {
    console.error("Supabase Auth or Token Generation Error:", error);
    return Response.json(
      { error: "Authentication failed with Supabase", details: error.message },
      { status: 500 }
    );
  }
}