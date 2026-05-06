import styles from '../styles/components/Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p>&copy; {new Date().getFullYear()} Soluciones Informáticas &mdash; InstaReports</p>
        </footer>
    );
};

export default Footer;
