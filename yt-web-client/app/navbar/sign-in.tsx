"use client";

import { Fragment } from "react";
import styles from "./navbar.module.css";
import { signInWithGoogle, signOutWithGoogle  } from "../firebase/firebase";
import { User } from "firebase/auth";

interface SignInProps {//define props type
    user: User | null;//user can be a User object or null
}

export default function SignIn({ user }: SignInProps) {//destructure user from props
  return (
    <Fragment>
      {user ? (
        <button className={styles.signin} onClick={signOutWithGoogle}>
          Sign Out
        </button>
      ) : (
        <button className={styles.signin} onClick={signInWithGoogle}>
          Sign In
        </button>
      )}
    </Fragment>
  );
}