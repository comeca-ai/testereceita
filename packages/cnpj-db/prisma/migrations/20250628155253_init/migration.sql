-- CreateTable
CREATE TABLE "empresas" (
    "id" SERIAL NOT NULL,
    "cnpj_base" TEXT NOT NULL,
    "razao_social" TEXT NOT NULL,
    "natureza_juridica" TEXT NOT NULL,
    "qualificacao_responsavel" TEXT NOT NULL,
    "capital_social" DECIMAL(65,30),
    "porte" TEXT,
    "ente_federativo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estabelecimentos" (
    "id" SERIAL NOT NULL,
    "cnpj" TEXT NOT NULL,
    "cnpj_base" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "situacao_cadastral" TEXT NOT NULL,
    "data_situacao_cadastral" TIMESTAMP(3) NOT NULL,
    "motivo_situacao_cadastral" TEXT,
    "data_inicio_atividade" TIMESTAMP(3) NOT NULL,
    "cnae_principal" TEXT NOT NULL,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cep" TEXT,
    "municipio" TEXT,
    "uf" TEXT,
    "telefone1" TEXT,
    "telefone2" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "estabelecimentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cnaes_secundarios" (
    "id" SERIAL NOT NULL,
    "estabelecimento_id" INTEGER NOT NULL,
    "codigo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cnaes_secundarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socios" (
    "id" SERIAL NOT NULL,
    "cnpj_base" TEXT NOT NULL,
    "identificador" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "qualificacao" TEXT NOT NULL,
    "data_entrada" TIMESTAMP(3) NOT NULL,
    "pais" TEXT,
    "representante_legal" TEXT,
    "identificador_representante" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "socios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simples_nacional" (
    "id" SERIAL NOT NULL,
    "cnpj_base" TEXT NOT NULL,
    "optante" BOOLEAN NOT NULL,
    "data_opcao" TIMESTAMP(3),
    "data_exclusao" TIMESTAMP(3),
    "optante_mei" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simples_nacional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "importacoes_rfb" (
    "id" SERIAL NOT NULL,
    "tipo_arquivo" TEXT NOT NULL,
    "nome_arquivo" TEXT NOT NULL,
    "data_importacao" TIMESTAMP(3) NOT NULL,
    "registros_processados" INTEGER NOT NULL,
    "registros_sucesso" INTEGER NOT NULL,
    "registros_erro" INTEGER NOT NULL,
    "tempo_processamento" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "importacoes_rfb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "empresas_cnpj_base_key" ON "empresas"("cnpj_base");

-- CreateIndex
CREATE UNIQUE INDEX "estabelecimentos_cnpj_key" ON "estabelecimentos"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "simples_nacional_cnpj_base_key" ON "simples_nacional"("cnpj_base");

-- AddForeignKey
ALTER TABLE "estabelecimentos" ADD CONSTRAINT "estabelecimentos_cnpj_base_fkey" FOREIGN KEY ("cnpj_base") REFERENCES "empresas"("cnpj_base") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cnaes_secundarios" ADD CONSTRAINT "cnaes_secundarios_estabelecimento_id_fkey" FOREIGN KEY ("estabelecimento_id") REFERENCES "estabelecimentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socios" ADD CONSTRAINT "socios_cnpj_base_fkey" FOREIGN KEY ("cnpj_base") REFERENCES "empresas"("cnpj_base") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simples_nacional" ADD CONSTRAINT "simples_nacional_cnpj_base_fkey" FOREIGN KEY ("cnpj_base") REFERENCES "empresas"("cnpj_base") ON DELETE RESTRICT ON UPDATE CASCADE;
