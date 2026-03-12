"use client"

import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Eye, EyeOff, Github, Chrome } from "lucide-react"
import { toast } from "sonner"

export function SignupForm() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const { error } = await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/onboarding",
        })
        setIsLoading(false)

        if (error) {
            toast.error(error.message || "Failed to sign up")
        }
    }

    const signupWithGoogle = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/onboarding",
        })
    }

    const signupWithGithub = async () => {
        await authClient.signIn.social({
            provider: "github",
            callbackURL: "/onboarding",
        })
    }

    return (
        <section className="login-section">
            <div className="login-container">
                <div className="login-form-panel">
                    <h1 className="login-title">Sign Up</h1>
                    <p className="login-welcome">Create your account</p>

                    <form className="login-form" onSubmit={handleSignup}>
                        <div className="form-group">
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <div className="password-wrapper">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="form-input"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Sign Up"}
                        </button>

                        <div className="social-login-separator">or continue with</div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="social-btn"
                                onClick={signupWithGoogle}
                            >
                                <Chrome size={18} /> Google
                            </button>
                            <button
                                type="button"
                                className="social-btn"
                                onClick={signupWithGithub}
                            >
                                <Github size={18} /> GitHub
                            </button>
                        </div>

                        <p className="signup-prompt">
                            Already have an account?{" "}
                            <Link href="/auth/sign-in" className="signup-link">Login</Link>
                        </p>
                    </form>
                </div>

                <div className="login-illustration signup-ellipse">
                    <img src="/Ellipse.svg" alt="" className="ellipse-bg" aria-hidden="true" />
                    <img src="/signup.svg" alt="Signup Illustration" className="signup-img" />
                </div>
            </div>
        </section>
    )
}
