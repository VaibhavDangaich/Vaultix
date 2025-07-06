"use client";

import { useForm } from 'react-hook-form';
import { useSignUp } from '@clerk/nextjs';
import { z } from 'zod';

//zod sign-up schema
import { signUpSchema } from '@/schemas/signUpSchema';
import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { divider } from '@heroui/theme';

function SignUpForm() {
    const router = useRouter();
    const [verifying, setVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [authError, setAuthError] = useState<string | null>(null);
    const [verificationError,setVerificationError]=useState<string | null>(null)
    const { signUp, isLoaded, setActive } = useSignUp();

    const {
        register,
        handleSubmit,
        formState: { errors },
        
    } = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            passwordConfirmation:""
        }
    })
    const submitHandler = async (data: z.infer<typeof signUpSchema>) => {
        if (!isLoaded) return;
        setIsSubmitting(true);
        setAuthError(null);
        try {
          await signUp.create({
            emailAddress: data.email,
            password: data.password,
          });
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });
          setVerifying(true);
        } catch (error: any) {
          console.error("SignUp error!!", error);
          setAuthError(
            error.errors?.[0]?.message || "An error occured during signUp!!"
          );
        } finally {
          setIsSubmitting(false);
        }
        
        
    }
    const handleVerificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isLoaded || !signUp) return;
        setIsSubmitting(true);
        setAuthError(null);

        try {
           const result= await signUp.attemptEmailAddressVerification({
                code:verificationCode
           })
            console.log("result ", result);
            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId })
                router.push("/dashboard");
            }
            else {
                console.error("Verification Incomplete!!", result);
                setVerificationError(
                   "Verification could not complete"
                )
            }
            
        } catch (error: any) {
            console.error("Incomplete Verification",error)
            setVerificationError(
              error.errors?.[0]?.message || "An error occured during signUp!!"
            );
            
        } finally {
            setIsSubmitting(false);
        }
        
    }

    if (verifying) {
        return (
          <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
            <CardBody className="flex flex-col gap-1 items-center pb-2">
              <h1 className=" text-2xl font-bold text-default-900">
                Verify your Email
              </h1>
              <p className="text-default-500 text-center">
                We have sent a verification code to your email
              </p>
            </CardBody>
            <CardBody className="py-6">
              {verificationError && (
                <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
                  <p>{verificationError}</p>
                </div>
              )}
              <form onSubmit={handleVerificationSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label
                    htmlFor="verificationCode"
                    className="text-sm font-medium text-default-900"
                  >
                    Verification Code
                  </label>
                  <input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter the 6 digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full"
                    autoFocus
                  ></input>
                </div>
                <button
                  type="submit"
                  color="primary"
                  className="w-full"
                  disabled={isSubmitting} 
                >
                  {isSubmitting ? "Verifying..." : "Verify Email"}
                </button>
              </form>
              <div className="mt-6 text-center">
                <p className="text-sm text-default-500">
                  Did not recive the code ?{" "}
                  <button
                    onClick={async () => {
                      if (signUp) {
                        await signUp.prepareEmailAddressVerification({
                          strategy: "email_code",
                        });
                      }
                    }}
                    className="text-primary hover:underline font-medium"
                  >
                    Resend Code
                  </button>
                </p>
              </div>
            </CardBody>
          </Card>
        );
    }
    return (
        <h1>SignUp form</h1>
    )
}

export default SignUpForm