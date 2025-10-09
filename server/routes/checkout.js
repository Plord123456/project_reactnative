import { Router } from "express";
import stripe from "../lib/stripe.js";
const router = Router();

router.get("/checkout", async (req, res) => {
  res.reqBody=await req.body ;
  const{email,price}=res.reqBody;

  //ensure price is in  a vaid number and convert to interger cents
  if(typeof price !=="number" || isNaN(price) || price<=0){
    return res.status(400).json({
      success: false,
      message: "Invalid price"
    });
  }

  //convert price to cents and ensure it's an integer
  const amountInCents = Math.round(price * 100);
  try{
    const customer = await stripe.customers.create(email);
const ephemeralKey = await stripe.ephemeralKeys.create(
  { customer: customer.id },
  { apiVersion: "2025-04-39.basil" }
);
const paymentIntent = await stripe.paymentIntents.create({
  amount: amountInCents,
  currency: "USD",
  customer: customer.id,
  automatic_payment_methods: {
    enabled: true,
  },
  receipt_email: email,
  description: `Order from ${email}`,
  metadata: { 
    enabled: true,
  },
});
   return res.status(200).json({  
    success: true,
    message: "Payment session created successfully",
    ephemeralKey: ephemeralKey.secret,
    customer: customer.id,
    paymentIntent: paymentIntent.client_secret,
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
  });
  }catch(error){
    console.log("Error creating payment session:",error);
    res.status(500).json({
      success:false,
      message:"Internal Server Error"
    });
  }
});

export default router;