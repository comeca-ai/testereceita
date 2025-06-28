import { Box, Typography, Paper } from '@mui/material';

const About = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Sobre o CNPJ Dashboard
      </Typography>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" paragraph>
          O CNPJ Dashboard é uma aplicação para consulta e visualização de dados 
          de empresas brasileiras da Receita Federal.
        </Typography>
        
        <Typography variant="body1" paragraph>
          Funcionalidades:
        </Typography>
        
        <Typography variant="body2" component="ul" sx={{ ml: 2 }}>
          <li>Consulta de empresas por CNPJ</li>
          <li>Visualização de estabelecimentos</li>
          <li>Informações de sócios</li>
          <li>Dados do Simples Nacional</li>
          <li>Busca avançada</li>
        </Typography>
        
        <Typography variant="body1" sx={{ mt: 2 }}>
          Versão: 1.0.0
        </Typography>
      </Paper>
    </Box>
  );
};

export default About;