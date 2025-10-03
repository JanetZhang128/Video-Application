"use client";

import Image from "next/image";
import styles from "./navbar.module.css";
import Link from "next/link";
import SignIn from "./sign-in";
import { useEffect, useState } from "react";
import { onAuthStateChangedHelper } from "../firebase/firebase";
import { User } from "firebase/auth";

export default function Navbar() {
    // Initialize user state
    const [user, setUser] = useState<User | null>(null);
    
    useEffect(() => {
    const unsubscribe = onAuthStateChangedHelper((user) => {
      setUser(user);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [] /* No dependencies, never rerun */);

  return (
    <nav className={styles.nav}>
      <Link href="/">
        <Image
          width={240}
          height={54}
          src="/YouTube-Logo.wine.svg"
          alt="YouTube Logo"
          className={styles.logo}
          priority //To ensure faster loading of the logo image
        />
      </Link>
      <SignIn user={user} />
    </nav>
  );
}