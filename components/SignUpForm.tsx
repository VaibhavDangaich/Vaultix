"use client";

import { useForm } from 'react-hook-form';
import { useSignUp } from '@clerk/nextjs';
import { z } from 'zod';

//zod sign-up schema
import { signUpSchema } from '@/schemas/signUpSchema';
import React, { useState } from 'react'

function SignUpForm() {
    const [verifying, setVerifying] = useState(false);
    const { signUp, isLoaded, setActive } = useSignUp();
    const {
        register,
        handleSubmit,
        formState: { errors },
        
    }=useForm<z.infer<typeof signUpSchema>>()
    const submitHandler = async () => {
        
    }
    const handleVerificationSubmit = async () => {
        
    }

    if (verifying) {
        return (
          <h1>This is the OTP field</h1>
      )
    }
    return (
        <h1>SignUp form</h1>
    )
}

export default SignUpForm