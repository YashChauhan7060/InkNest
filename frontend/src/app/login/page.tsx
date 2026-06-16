"use client";
import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { 
    Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAppData, user_service } from '@/src/context/AppContext';
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter  } from 'next/navigation';
import Loading from '@/src/components/loading';



const LoginPage = () => {
  const { isAuth, setIsAuth, loading, setLoading, setUser } = useAppData();

  const router = useRouter();

  useEffect(() => {
    if (isAuth) {
      router.push("/");
    }
  }, [isAuth]);


  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${user_service}/api/v1/login`, {
        code: authResult["code"],
      });

      Cookies.set("token", result.data.token, {
        expires: 5,
        secure: true,
        path: "/",
      });
      toast.success(result.data.message);
      setIsAuth(true);
      setLoading(false);
      setUser(result.data.user);
    } catch (error) {
      console.log("error", error);
      toast.error("Problem while login you");
      setLoading(false);
    }
  };


  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });


 return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="h-screen  w-full flex items-center justify-center p-4 bg-linear-to-br from-primary/30 via-background to-secondary/30 ">
          <div className="transform -translate-y-[5%] w-full flex justify-center">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-secondary/30 rounded-full blur-3xl pointer-events-none" />
          <Card className="w-100 animate-fade-up">
            <CardHeader className="text-center pt-4">
               <div className="inline-flex items-center justify-center w-14 h-14 rounded-[14px] bg-white/20 dark:bg-white/10 border border-white/20 mb-4 mx-auto animate-float text-2xl">
                ✍️
              </div>
              <CardTitle className="text-2xl mb-1">Login to InkNest</CardTitle>
              <CardDescription className="text-sm leading-relaxed">Your home for ideas and writing that matters.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Button onClick={googleLogin} className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-card hover:bg-muted border border-border text-foreground transition-all duration-150">
                Login with google{" "}
                <img
                  src={"/google.png"}
                  className="w-6 h-6"
                  alt="google icon"
                />
              </Button>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/20" />
                <span className="text-xs text-muted-foreground">Why InkNest?</span>
                <div className="flex-1 h-px bg-white/20" />
              </div>
             <div className="flex flex-col gap-2.5">
                {[
                  { icon: "✏️", title: "Write & publish", desc: "Rich text editor with AI grammar fix" },
                  { icon: "✨", title: "AI-powered titles", desc: "Let AI suggest better titles & descriptions" },
                  { icon: "👥", title: "Grow your audience", desc: "Share stories with readers who care" },
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white/10 dark:bg-white/5 border border-white/10 rounded-lg">
                    <span className="text-lg">{f.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{f.title}</p>
                      <p className="text-xs text-muted-foreground">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground text-center pt-1">
                By continuing, you agree to our{" "}
                <span className="underline cursor-pointer hover:text-foreground transition-colors">Terms</span>{" "}
                and{" "}
                <span className="underline cursor-pointer hover:text-foreground transition-colors">Privacy Policy</span>
              </p>

            </CardContent>
          </Card>
        </div>
        </div>
      )}
    </>
  );
};

export default LoginPage;