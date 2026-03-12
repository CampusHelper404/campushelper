import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import "../auth.css"

export const dynamicParams = false

export function generateStaticParams() {
    return [
        { path: "sign-in" },
        { path: "sign-up" },
        { path: "forgot-password" },
        { path: "reset-password" },
        { path: "callback" },
    ]
}

export default async function AuthPage({
    params
}: {
    params: Promise<{ path: string }>
}) {
    const { path } = await params

    const renderForm = () => {
        switch (path) {
            case "sign-in":
                return <LoginForm />
            case "sign-up":
                return <SignupForm />
            default:
                return (
                    <div className="flex flex-col items-center gap-4">
                        <p className="text-muted-foreground">This page is under construction.</p>
                        <Link href="/auth/sign-in" className="text-primary underline">Back to Login</Link>
                    </div>
                )
        }
    }

    return (
        <main className="flex grow flex-col items-center justify-center p-2 min-h-screen">
            <div className="flex flex-col items-center w-full max-w-fit gap-2">
                {renderForm()}
                
                {!["callback", "sign-out"].includes(path) && (
                    <p className="w-full text-center text-muted-foreground text-[10px] leading-tight opacity-70">
                        By continuing, you agree to our{" "}
                        <Link className="text-warning underline decoration-warning/30" href="/terms" target="_blank">Terms of Service</Link>
                        {" "}and{" "}
                        <Link className="text-warning underline decoration-warning/30" href="/privacy" target="_blank">Privacy Policy</Link>
                        .
                    </p>
                )}
            </div>
        </main>
    )
}