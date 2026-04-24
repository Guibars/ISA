export interface StructurePart {
  id: string;
  name: string;
  brand: string;
  category: string;
  imageUrl: string;
  brandLogo?: string;
}

export const STRUCTURE_PARTS: StructurePart[] = [
  {
    id: '1',
    name: 'Fixador Final',
    brand: 'CCM',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/PJmm2C2n/Fixador-Final-CCM.png'
  },
  {
    id: '2',
    name: 'Fixador Intermediário',
    brand: 'CCM',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/CxMjsL83/Fixador-Intermediario-CCM.png'
  },
  {
    id: '3',
    name: 'L Maior',
    brand: 'CCM',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/vHhnTFK4/L-MAIOR-CCM.png'
  },
  {
    id: '4',
    name: 'Parafuso Fibromadeira | Estrutural',
    brand: 'CCM',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/jSkJ66tJ/PARAFUSO-FIBROMADEIRA-CCM.png'
  },
  {
    id: '5',
    name: 'Parafuso M8X20',
    brand: 'CCM',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/tgKZwXsv/Parafuso-m8x20-CCM.png'
  },
  {
    id: '6',
    name: 'Perfil | Trilho 2.40m',
    brand: 'CCM',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/sDjBtH2D/Perfil-Trilho-CCM-2-40M.png'
  },
  {
    id: '7',
    name: 'Tela de Emenda',
    brand: 'CCM',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/XN8qcKkR/Tela-de-Emenda-CCM.png'
  },
  {
    id: 'sg1',
    name: 'Perfil Lateral 2.40M',
    brand: 'Solar Group',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/kg6fL3GR/Perfil_Lateral_2_40m_Solar_Group_removebg_preview.png',
    brandLogo: 'https://i.postimg.cc/j2fyZKZP/logo_fundo_claro_600px_(1).png'
  },
  {
    id: 'sg2',
    name: 'Parafuso Fibromadeira | Estrutural | Barra Roscada Maior',
    brand: 'Solar Group',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/jS74ZHkY/Parufoso_Fibromadeira_Estrutural_Barra_Roscada_Maior_Solar_group_removebg_preview.png',
    brandLogo: 'https://i.postimg.cc/j2fyZKZP/logo_fundo_claro_600px_(1).png'
  },
  {
    id: 'sg3',
    name: 'Parafuso Martelo M8',
    brand: 'Solar Group',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/3Nq2ZNXw/Parafuso_Martelo_M8_Solar_Group_removebg_preview.png',
    brandLogo: 'https://i.postimg.cc/j2fyZKZP/logo_fundo_claro_600px_(1).png'
  },
  {
    id: 'sg4',
    name: 'Kit Junção',
    brand: 'Solar Group',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/QMq5y0Q7/Kit_Junção_Solar_Group_removebg_preview.png',
    brandLogo: 'https://i.postimg.cc/j2fyZKZP/logo_fundo_claro_600px_(1).png'
  },
  {
    id: 'sg5',
    name: 'Fixador Intermediário Smart',
    brand: 'Solar Group',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/KjCgMV2s/Fixador_Intermediario_Smart_Solar_Group_removebg_preview.png',
    brandLogo: 'https://i.postimg.cc/j2fyZKZP/logo_fundo_claro_600px_(1).png'
  },
  {
    id: 'sg6',
    name: 'Fixador Final',
    brand: 'Solar Group',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/R0G6Rq9z/Fixador_final_Solar_Group_removebg_preview.png',
    brandLogo: 'https://i.postimg.cc/j2fyZKZP/logo_fundo_claro_600px_(1).png'
  },
  {
    id: 'pt1',
    name: 'Fixador Final',
    brand: 'Pratyc',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/XvfBypG0/Fixador-Final-Pratyc-removebg-preview.png',
    brandLogo: 'https://i.postimg.cc/pdRX4kTn/Perfil_Pratyc_2_40M_removebg_preview.png'
  },
  {
    id: 'pt2',
    name: 'Fixador Intermediário',
    brand: 'Pratyc',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/HnhrCMKV/Fixador-Intermediario-Pratyc-removebg-preview.png',
    brandLogo: 'https://i.postimg.cc/pdRX4kTn/Perfil_Pratyc_2_40M_removebg_preview.png'
  },
  {
    id: 'pt3',
    name: 'Kit Junção',
    brand: 'Pratyc',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/5tSj2TGq/Kit-Juncao-Pratyc-removebg-preview.png',
    brandLogo: 'https://i.postimg.cc/pdRX4kTn/Perfil_Pratyc_2_40M_removebg_preview.png'
  },
  {
    id: 'pt4',
    name: 'Parafuso Fibromadeira | Fibrocimento Estrutural',
    brand: 'Pratyc',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/6qgpPX2c/Parafuso-Fibromadeira-estrutural-Pratyc-removebg-preview.png',
    brandLogo: 'https://i.postimg.cc/pdRX4kTn/Perfil_Pratyc_2_40M_removebg_preview.png'
  },
  {
    id: 'pt5',
    name: 'Perfil Pratyc 2.40M',
    brand: 'Pratyc',
    category: 'Fibrocimento',
    imageUrl: 'https://i.postimg.cc/pdRX4kTn/Perfil_Pratyc_2_40M_removebg_preview.png',
    brandLogo: 'https://i.postimg.cc/pdRX4kTn/Perfil_Pratyc_2_40M_removebg_preview.png'
  },
  {
    id: 'sa1',
    name: 'Fixador Final Fibrometal',
    brand: 'Solar A+',
    category: 'Fibrometal',
    imageUrl: 'https://i.postimg.cc/ZRzhQxLd/Fixador-Final-Fibrometal-Solar-A-removebg-preview.png',
    brandLogo: 'https://i.postimg.cc/MZ4YJ3QC/logo-Solar-A.png'
  },
  {
    id: 'sa2',
    name: 'Fixador Intermediário Fibrometal',
    brand: 'Solar A+',
    category: 'Fibrometal',
    imageUrl: 'https://i.postimg.cc/NMcWDfgz/Fixador-Intermediario-Fibrometal-Solar-A-removebg-preview.png',
    brandLogo: 'https://i.postimg.cc/MZ4YJ3QC/logo-Solar-A.png'
  },
  {
    id: 'sa3',
    name: 'Kit Junção Fibrometal',
    brand: 'Solar A+',
    category: 'Fibrometal',
    imageUrl: 'https://i.postimg.cc/tCT82cj0/Kit-Juncao-Fibrometal-Solar-A-removebg-preview.png',
    brandLogo: 'https://i.postimg.cc/MZ4YJ3QC/logo-Solar-A.png'
  },
  {
    id: 'sa4',
    name: 'Parafuso Fibrometal / Parafuso Estrutural',
    brand: 'Solar A+',
    category: 'Fibrometal',
    imageUrl: 'https://i.postimg.cc/3R1bZXfT/Parafuso-Estrutural-Fibrometal-Solar-A-removebg-preview.png',
    brandLogo: 'https://i.postimg.cc/MZ4YJ3QC/logo-Solar-A.png'
  },
  {
    id: 'sa5',
    name: 'Parafuso Martelo M10 Porcas M10',
    brand: 'Solar A+',
    category: 'Fibrometal',
    imageUrl: 'https://i.postimg.cc/Vv54B3bq/Parafuso-Martelo-M10-Porcas-M10-removebg-preview.png',
    brandLogo: 'https://i.postimg.cc/MZ4YJ3QC/logo-Solar-A.png'
  },
  {
    id: 'sa6',
    name: 'Perfil Trilho Fibrometal',
    brand: 'Solar A+',
    category: 'Fibrometal',
    imageUrl: 'https://i.postimg.cc/PfFSrrgT/Perfil-Trilho-Fibrometal-Solar-A-removebg-preview.png',
    brandLogo: 'https://i.postimg.cc/MZ4YJ3QC/logo-Solar-A.png'
  }
];
