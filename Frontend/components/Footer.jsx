// components/Footer.jsx
import styles from '../styles/components/Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <p>&copy; {new Date().getFullYear()} Soluciones Informáticas. Todos los derechos reservados.</p>
        </footer>
    );
};

export default Footer;