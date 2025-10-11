import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { readAsStringAsync } from 'expo-file-system/legacy';
import { decode } from 'base64-arraybuffer';
import { supabase } from '@/lib/superbase';
import { useAuthStore } from '@/store/auth';
import Wrapper from '@/components/Wrapper';
import CommonHeader from '@/components/CommonHeader';
import AppColors from '@/constants/theme';
import { useRouter } from 'expo-router';

const EditProfileScreen = () => {
  const { user, refreshUser, isLoading } = useAuthStore();
  const router = useRouter();
  const [fullName, setFullName] = useState(user?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

 const pickImage = async () => {
  if (!user) {
    Alert.alert('Login required', 'Please sign in to update your profile.');
    return;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    const image = result.assets?.[0];
    if (!image?.uri) {
      Alert.alert('Upload failed', 'Could not read the selected image.');
      return;
    }

    setIsUploading(true);

    const splitName = image.uri.split('/').pop() ?? `avatar-${Date.now()}`;
    const fileExt = splitName.includes('.') ? splitName.split('.').pop() ?? 'jpg' : 'jpg';
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    const contentType = image.mimeType ?? image.type ?? `image/${fileExt}`;

    const base64 = await readAsStringAsync(image.uri, {
      encoding: 'base64',
    });

    const fileBuffer = decode(base64);

    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from('avatars')
      .getPublicUrl(data.path);

    setAvatarUrl(publicData.publicUrl);

  } catch (error: any) {
    // Hiển thị lỗi cho người dùng và log ra console để debug
    console.error('Avatar upload failed:', error);
    Alert.alert('Upload failed', error?.message ?? 'Unable to upload the selected image.');
  } finally {
    // Luôn đảm bảo rằng trạng thái loading được tắt dù thành công hay thất bại
    setIsUploading(false);
  }
};

  const handleUpdateProfile = async () => {
    if (!user) {
      Alert.alert('Login required', 'Please sign in to update your profile.');
      return;
    }

    const trimmedName = fullName.trim();
    if (!trimmedName) {
      Alert.alert('Invalid name', 'Please enter your full name.');
      return;
    }

    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: trimmedName,
          avatar_url: avatarUrl,
        });

      if (error) {
        throw error;
      }

      await refreshUser();
      Alert.alert('Profile updated', 'Your information has been saved.', [
        {
          text: 'OK',
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/(tabs)/profile');
            }
          },
        },
      ]);
    } catch (error: any) {
      console.error('Profile update failed:', error);
      Alert.alert('Update failed', error?.message ?? 'Unable to update profile at this time.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Wrapper>
  <CommonHeader title="Edit Profile" onBackPress={() => router.back()} />
        <View style={styles.centerContent}>
          <ActivityIndicator color={AppColors.primary[500]} />
        </View>
      </Wrapper>
    );
  }

  if (!user) {
    return (
      <Wrapper>
        <CommonHeader title="Edit Profile" />
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>Please sign in to edit your profile.</Text>
        </View>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <CommonHeader
        title="Edit Profile"
        onBackPress={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.push('/(tabs)/profile');
        }}
      />
      <View style={styles.content}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} disabled={isUploading || isSaving}>
          <Image
            source={{ uri: avatarUrl ?? 'https://via.placeholder.com/150' }}
            style={styles.avatar}
          />
          <Text style={styles.changeText}>{isUploading ? 'Uploading…' : 'Change Photo'}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Full Name"
          autoCapitalize="words"
          editable={!isSaving}
        />

        <TouchableOpacity
          style={[styles.saveButton, (isSaving || isUploading) && styles.disabledButton]}
          onPress={handleUpdateProfile}
          disabled={isSaving || isUploading}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    padding: 24,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  infoText: {
    fontSize: 16,
    color: AppColors.text.secondary,
    textAlign: 'center',
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 8,
    backgroundColor: AppColors.gray[100],
  },
  changeText: {
    color: AppColors.primary[500],
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.gray[200],
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: AppColors.text.primary,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: AppColors.primary[500],
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EditProfileScreen;