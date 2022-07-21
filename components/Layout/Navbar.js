import { useRouter } from "next/dist/client/router";
import React from "react";
import { Menu, Container, Icon } from "semantic-ui-react";
import Link from "next/link";

function Navbar() {
  const router = useRouter();

  const isActive = (route) => router.pathname === route;

  return (
    <Menu pointing secondary borderless>
      <Container>
        <Link href="/login">
          <Menu.Item header active={isActive("/login")}>
            {/* <Icon size="small" name="sign in" /> */}
            Log In
          </Menu.Item>
        </Link>

        <Link href="/signup">
          <Menu.Item header active={isActive("/signup")}>
            {/* <Icon size="medium" name="signup" /> */}
            Sign Up
          </Menu.Item>
        </Link>
      </Container>
    </Menu>
  );
}

export default Navbar;
