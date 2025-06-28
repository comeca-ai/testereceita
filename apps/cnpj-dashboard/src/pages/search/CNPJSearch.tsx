import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  Divider,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// import { CNPJProcessor } from 'cnpj-core';
import axios from 'axios';

interface SearchResult {
  empresa: {
    cnpjBase: string;
    razaoSocial: string;
    naturezaJuridica: string;
    porte: string;
    capitalSocial: number;
  };
  estabelecimento: {
    cnpj: string;
    nomeFantasia: string;
    situacaoCadastral: string;
    cnaePrincipal: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    municipio: string;
    uf: string;
    cep: string;
  };
  simplesNacional?: {
    optante: boolean;
    optanteMEI: boolean;
    dataOpcao?: string;
  };
}

const CNPJSearch = () => {
  const [cnpj, setCnpj] = useState('');
  const [formattedCnpj, setFormattedCnpj] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResult | null>(null);
  const navigate = useNavigate();

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCnpj(value);
    
    try {
      // Tenta formatar o CNPJ conforme o usuário digita
      if (value) {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 14) {
          // Formatação simples de CNPJ
          const formatCNPJ = (cnpj: string) => {
            if (cnpj.length !== 14) return cnpj;
            return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
          };
          setFormattedCnpj(formatCNPJ(cleaned));
        }
      } else {
        setFormattedCnpj('');
      }
    } catch (err) {
      // Ignora erros de formatação enquanto o usuário digita
      setFormattedCnpj(value);
    }
  };

  const handleSearch = async () => {
    // Limpa erros anteriores
    setError(null);
    
    // Valida o CNPJ
    const cleanedCnpj = cnpj.replace(/\D/g, '');
    if (cleanedCnpj.length !== 14) {
      setError('CNPJ inválido. Deve ter 14 dígitos.');
      return;
    }
    
    try {
      setLoading(true);
      
      // Em um cenário real, esta seria uma chamada à API
      // Por enquanto, vamos simular com dados estáticos
      
      // Simulação de resposta da API
      setTimeout(() => {
        const mockResult: SearchResult = {
          empresa: {
            cnpjBase: cleanedCnpj.substring(0, 8),
            razaoSocial: 'EMPRESA DEMONSTRAÇÃO LTDA',
            naturezaJuridica: 'SOCIEDADE EMPRESÁRIA LIMITADA',
            porte: 'DEMAIS',
            capitalSocial: 100000.00,
          },
          estabelecimento: {
            cnpj: cleanedCnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5'),
            nomeFantasia: 'DEMO COMPANY',
            situacaoCadastral: 'ATIVA',
            cnaePrincipal: '6201500',
            logradouro: 'RUA EXEMPLO',
            numero: '123',
            complemento: 'SALA 456',
            bairro: 'CENTRO',
            municipio: 'SÃO PAULO',
            uf: 'SP',
            cep: '01001000',
          },
          simplesNacional: {
            optante: true,
            optanteMEI: false,
            dataOpcao: '2022-01-01',
          },
        };
        
        setResult(mockResult);
        setLoading(false);
      }, 1500);
      
    } catch (err) {
      console.error('Erro ao buscar CNPJ:', err);
      setError('Não foi possível realizar a consulta. Tente novamente mais tarde.');
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    if (result) {
      navigate(`/empresas/${result.empresa.cnpjBase}`);
    }
  };

  const getSituacaoCadastralLabel = (codigo: string) => {
    const situacoes: Record<string, string> = {
      '1': 'NULA',
      '2': 'ATIVA',
      '3': 'SUSPENSA',
      '4': 'INAPTA',
      '8': 'BAIXADA',
    };
    return situacoes[codigo] || codigo;
  };

  const getSituacaoCadastralColor = (codigo: string) => {
    const cores: Record<string, string> = {
      '1': 'error',
      '2': 'success',
      '3': 'warning',
      '4': 'error',
      '8': 'error',
    };
    return cores[codigo] as 'error' | 'success' | 'warning' | 'info';
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom component="h1">
        Consulta de CNPJ
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box component="form" sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <TextField
            label="CNPJ"
            variant="outlined"
            value={formattedCnpj}
            onChange={handleCnpjChange}
            placeholder="00.000.000/0000-00"
            fullWidth
            inputProps={{ maxLength: 18 }}
            helperText="Digite apenas números ou no formato XX.XXX.XXX/XXXX-XX"
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={handleSearch}
            disabled={loading}
            sx={{ height: 56 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Consultar'}
          </Button>
        </Box>
      </Paper>
      
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}
      
      {result && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="div">
                {result.empresa.razaoSocial}
              </Typography>
              <Chip
                label={getSituacaoCadastralLabel(result.estabelecimento.situacaoCadastral)}
                color={getSituacaoCadastralColor(result.estabelecimento.situacaoCadastral)}
              />
            </Box>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              CNPJ: {result.estabelecimento.cnpj}
            </Typography>
            
            {result.estabelecimento.nomeFantasia && (
              <Typography variant="body1" gutterBottom>
                Nome Fantasia: {result.estabelecimento.nomeFantasia}
              </Typography>
            )}
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Informações Cadastrais</Typography>
                <Typography variant="body2">
                  Natureza Jurídica: {result.empresa.naturezaJuridica}
                </Typography>
                <Typography variant="body2">
                  Porte: {result.empresa.porte}
                </Typography>
                <Typography variant="body2">
                  Capital Social: R$ {result.empresa.capitalSocial.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Typography>
                <Typography variant="body2">
                  CNAE Principal: {result.estabelecimento.cnaePrincipal}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Endereço</Typography>
                <Typography variant="body2">
                  {result.estabelecimento.logradouro}, {result.estabelecimento.numero}
                  {result.estabelecimento.complemento ? ` - ${result.estabelecimento.complemento}` : ''}
                </Typography>
                <Typography variant="body2">
                  {result.estabelecimento.bairro}
                </Typography>
                <Typography variant="body2">
                  {result.estabelecimento.municipio} - {result.estabelecimento.uf}
                </Typography>
                <Typography variant="body2">
                  CEP: {result.estabelecimento.cep}
                </Typography>
              </Grid>
            </Grid>
            
            {result.simplesNacional && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle2">Simples Nacional</Typography>
                  <Typography variant="body2">
                    Optante: {result.simplesNacional.optante ? 'Sim' : 'Não'}
                  </Typography>
                  {result.simplesNacional.optante && (
                    <>
                      <Typography variant="body2">
                        Optante MEI: {result.simplesNacional.optanteMEI ? 'Sim' : 'Não'}
                      </Typography>
                      {result.simplesNacional.dataOpcao && (
                        <Typography variant="body2">
                          Data de Opção: {new Date(result.simplesNacional.dataOpcao).toLocaleDateString('pt-BR')}
                        </Typography>
                      )}
                    </>
                  )}
                </Box>
              </>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={handleViewDetails}>
                Ver Detalhes Completos
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default CNPJSearch;
