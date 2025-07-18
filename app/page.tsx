import SignInForm from "@/components/SignInForm";
import SignUpForm from "@/components/SignUpForm";
import DarkVeil from "../components/ui/DarkVeil"

export default function Home() {
  return (
    <div className="w-full h-screen relative">
      <div className="absolute w-full h-full">
        <DarkVeil speed={2} />
      </div>

      <div className="absolute flex justify-center items-center w-full h-full ">
        <SignInForm></SignInForm>
      </div>
    </div>
  );
}
