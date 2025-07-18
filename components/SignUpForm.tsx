"use client";
import { Button, ButtonGroup } from "@heroui/button";
import { useForm } from 'react-hook-form';
import { useSignUp } from '@clerk/nextjs';
import { Input } from "@heroui/input";
import { z } from 'zod';
import { Divider } from "@heroui/divider";
import {
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Lock,
} from "lucide-react";
import Link from "next/link";

//zod sign-up schema
import { signUpSchema } from '@/schemas/signUpSchema';
import React, { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";


function SignUpForm() {
    const router = useRouter();
    const [verifying, setVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");
    const [authError, setAuthError] = useState<string | null>(null);
    const [verificationError,setVerificationError]=useState<string | null>(null)
    const { signUp, isLoaded, setActive } = useSignUp();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          <Card className="p-6 rounded-2xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 opacity-60 shadow-lg max-w-md mx-auto backdrop-blur-3xl">
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
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className="text-2xl font-bold text-default-900">
            Create Your Account
          </h1>
          <p className="text-default-500 text-center">
            Sign up to start managing your images securely
          </p>
        </CardHeader>

        <Divider />

        <CardBody className="py-6">
          {authError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-default-900"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                startContent={<Mail className="h-4 w-4 text-default-500" />}
                isInvalid={!!errors.email}
                errorMessage={errors.email?.message}
                {...register("email")}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-default-900"
              >
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                startContent={<Lock className="h-4 w-4 text-default-500" />}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-default-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-default-500" />
                    )}
                  </Button>
                }
                isInvalid={!!errors.password}
                errorMessage={errors.password?.message}
                {...register("password")}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="passwordConfirmation"
                className="text-sm font-medium text-default-900"
              >
                Confirm Password
              </label>
              <Input
                id="passwordConfirmation"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                startContent={<Lock className="h-4 w-4 text-default-500" />}
                endContent={
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-default-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-default-500" />
                    )}
                  </Button>
                }
                isInvalid={!!errors.passwordConfirmation}
                errorMessage={errors.passwordConfirmation?.message}
                {...register("passwordConfirmation")}
                className="w-full"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-default-600">
                  By signing up, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </div>
            </div>

            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </CardBody>

        <Divider />

        <CardFooter className="flex justify-center py-4">
          <p className="text-sm text-default-600">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
}

export default SignUpForm