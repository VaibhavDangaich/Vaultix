"use client"
import { Button, ButtonGroup } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  CheckCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Mail,
  Lock,
} from "lucide-react";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInSchema } from "@/schemas/signInSchema";
import { useState } from "react";
import { Divider } from "@heroui/divider";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Bruno_Ace } from "next/font/google";
import Link from "next/link";

export default function SignInForm() { 
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { signIn, isLoaded, setActive } = useSignIn();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [authError, setAuthError] = useState<string | null>(null);
    const {register,handleSubmit } = useForm({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password:""
        }
    })
    const submitHandler = async (data:z.infer<typeof signInSchema>) => {
        if (!isLoaded) return;
        setIsSubmitting(true);
        setAuthError(null);
        try {
            const result= await signIn.create({
                identifier: data.email,
                password:data.password
            })
            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/dashboard");
            } else {
                setAuthError("Invalid credentials, please try again.");

            }
            
        } catch (error:any) { 
            setAuthError(
                error.errors?.[0]?.message || "An unexpected error occurred. Please try again."
            )

        } finally {
            setIsSubmitting(false);
        }
    }
    return (
      <Card className="w-full max-w-md border border-default-200 bg-default-50 shadow-xl">
        <CardHeader className="flex flex-col gap-1 items-center pb-2">
          <h1 className=" text-2xl font-bold text-default-900">
            Welcome Back!!
          </h1>
          <p className="text-default-500 text-center">
            Sign In to access your secured cloud storage
          </p>
        </CardHeader>
        <Divider></Divider>
        <CardBody className="py-6">
          {authError && (
            <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-6 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0"></AlertCircle>
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
                placeholder="john.doe@gmail.com"
                startContent={
                  <Mail className="h-4 w-4 text-default-900"></Mail>
                }
                {...register("email")}
                className="w-full"
              ></Input>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-black"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="......."
                  startContent={<Lock className="h-4 w-4 text-black"></Lock>}
                  endContent={
                    <Button
                      isIconOnly
                      variant="light"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-black"></EyeOff>
                      ) : (
                        <Eye className="h-4 w-4 text-black"></Eye>
                      )}
                    </Button>
                  }
                  {...register("password")}
                  className="w-full"
                ></Input>
              </div>
            </div>
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={isSubmitting}
            >
              {isSubmitting ? "signing in..." : "Sign In"}
            </Button>
          </form>
            </CardBody>
            <Divider></Divider>
            <CardFooter className="flex justify-center py-4">
                <p className="text-sm text-black">
                    Don't have an account?{" "}
                    <Link href="/sign-up"
                        className="text-primary hover:underline font-medium">
                        Sign Up
                    </Link>
                  

                </p>

            </CardFooter>
      </Card>
    );
}