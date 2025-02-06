import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { button as buttonStyles } from "@heroui/theme";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";

export default function IndexPage() {
  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <span className={title({ color: "violet" })}>AI-Powered Email Replies&nbsp;</span>
          <br />
          <span className={title()}>
          Automate your email responses with AI.
          </span>
          <div className={subtitle({ class: "mt-4" })}>
          Let our smart assistant handle
          your inbox so you can focus on what truly matters.
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            isExternal
            className={buttonStyles({ variant: "bordered", radius: "full" })}
            href="http://localhost:3000/auth/google"
          >
            <img width="24" height="24" src="https://img.icons8.com/color/48/google-logo.png" alt="google-logo"/>
            Sign in with Google
          </Link>
        </div>

        <div className="mt-8">
          <Snippet hideCopyButton hideSymbol variant="bordered">
            <span>
              Smart replies, easy setup. get started in seconds 🚀{" "}
              {/* <Code color="primary">Email Required</Code> */}
            </span>
          </Snippet>
        </div>
      </section>
    </DefaultLayout>
  );
}
