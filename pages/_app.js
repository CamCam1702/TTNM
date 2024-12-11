import Layout from '../components/Layout';
import 'bootswatch/dist/darkly/bootstrap.min.css';
import '../styles/globals.css';
import '../styles/index.css'

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
