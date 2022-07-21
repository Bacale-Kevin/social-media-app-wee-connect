import { Message, Icon, Divider } from "semantic-ui-react";
import { useRouter } from "next/router";
import Link from "next/link";

export const HeaderMessage = () => {
  const router = useRouter();
  const signupRoute = router.pathname === "/signup";

  return (
    <Message
      color="teal"
      attached
      header={signupRoute ? "Get Started" : "Welcome Back"}
      content={signupRoute ? " Create New Account " : "Login with Email and Password"}
    />
  );
};

export const FooterMessage = () => {
  const router = useRouter();
  const signupRoute = router.pathname === "/signup";

  return (
    <>
      {signupRoute ? (
        <>
          <Message attached="bottom" warning>
            <Icon name="help" />
            Already have an account ? <Link href="/login">Login Instead</Link>
          </Message>
          <Divider hidden />
        </>
      ) : (
        <>
          <Message attached="bottom" info>
            <Icon name="lock" />
            <Link href="/login">Forgot Password</Link>
          </Message>

          <Message attached="bottom" warning>
            <Icon name="help" />
            New User ? {" "} <Link href="/login">Create an Account Here</Link>
          </Message>
        </>
      )}
    </>
  );
};
