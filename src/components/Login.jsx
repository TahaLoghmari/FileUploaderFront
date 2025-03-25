import { useForm } from "react-hook-form";
import { ThemeProvider } from "./theme-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { API_BASE_URL } from "@/lib/api";
import { Link } from "react-router-dom";

const formSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(3, "Password must be at least 3 characters"),
});

export default function Login() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const onSubmit = async (data) => {
    setAuthError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/Auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          setAuthError("Invalid username or password");
        } else {
          setAuthError(`Login failed: ${response.statusText}`);
        }
        return;
      }
      const responseData = await response.json();
      localStorage.setItem("token", responseData.token);
      navigate("/");
    } catch (error) {
      setAuthError(`${error} , Please try again.`);
    }
  };

  return (
    <ThemeProvider>
      <div className="w-screen h-screen flex items-center justify-center">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto mt-6 max-w-sm space-y-4 rounded-sm border p-6 "
          >
            {authError && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
                {authError}
              </div>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter Password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="mt-2"
            >
              {form.formState.isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
            <div className="text-center text-sm flex flex-col items-center justify-center mt-4">
              <p>Don't have an account? </p>
              <Link
                to="/register"
                className="text-primary font-semibold hover:underline"
              >
                Create one now
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </ThemeProvider>
  );
}
