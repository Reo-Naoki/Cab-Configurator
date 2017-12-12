import axios from 'axios';

const isProductionBuild = process.env.NODE_ENV === 'production';
const path = isProductionBuild ? 'https://dessinetonmeuble.fr/' : 'https://dev.dessinetonmeuble.fr/';

export default axios.create({
  baseURL: `${path}/modules/adesigner/fabapi.php`,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
