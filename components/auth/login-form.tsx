"use client"

import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { Eye, EyeOff, Github, Chrome } from "lucide-react"
import { toast } from "sonner"

export function LoginForm() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        const { error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/user-dashboard", // redirects to role-appropriate dashboard
        })
        setIsLoading(false)

        if (error) {
            toast.error(error.message || "Failed to sign in")
        }
    }

    const loginWithGoogle = async () => {
        await authClient.signIn.social({
            provider: "google",
            callbackURL: "/user-dashboard",
        })
    }

    const loginWithGithub = async () => {
        await authClient.signIn.social({
            provider: "github",
            callbackURL: "/user-dashboard",
        })
    }

    return (
        <section className="login-section">
            <div className="login-container">
                <div className="login-form-panel">
                    <h1 className="login-title">Login Now</h1>
                    <p className="login-welcome">Hi, Welcome Back</p>

                    <form className="login-form" onSubmit={handleLogin}>
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

                        <div className="form-options">
                            <label className="remember-me">
                                <input type="checkbox" />
                                <span className="remember-text">Remember Me</span>
                            </label>
                            <Link href="#" className="forgot-password">Forgot Password</Link>
                        </div>

                        <button type="submit" className="login-btn" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </button>

                        <div className="social-login-separator">or continue with</div>

                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="social-btn"
                                onClick={loginWithGoogle}
                            >
                                <Chrome size={18} /> Google
                            </button>
                            <button
                                type="button"
                                className="social-btn"
                                onClick={loginWithGithub}
                            >
                                <Github size={18} /> GitHub
                            </button>
                        </div>

                        <p className="signup-prompt">
                            Don't have an account?{" "}
                            <Link href="/auth/sign-up" className="signup-link">Sign Up</Link>
                        </p>
                    </form>
                </div>

                <div className="login-illustration">
                    <img src="/login.svg" alt="Login Illustration" />
                </div>
            </div>
        </section>
    )
}
