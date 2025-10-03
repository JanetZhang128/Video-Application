import Image from "next/image";
import styles from "./navbar.module.css";
import Link from "next/link";

export default function Navbar() {
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
    </nav>
  );
}