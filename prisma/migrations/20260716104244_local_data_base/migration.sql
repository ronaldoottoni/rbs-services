-- CreateEnum
CREATE TYPE "PessoaTipo" AS ENUM ('CLIENTE', 'FORNECEDOR', 'FUNCIONARIO', 'TRANSPORTADORA', 'BANCO');

-- CreateEnum
CREATE TYPE "PropriedadeTipo" AS ENUM ('FAZENDA', 'SITIO', 'CHACARA', 'OUTRO');

-- CreateEnum
CREATE TYPE "AreaTipo" AS ENUM ('CULTIVO', 'PASTAGEM', 'RESERVA', 'APP', 'SEDE', 'ESTRADA', 'AGUA', 'OUTRO');

-- CreateEnum
CREATE TYPE "ServicoTipo" AS ENUM ('DRONE', 'AMBIENTAL', 'IRRIGACAO', 'CONSULTORIA', 'OUTRO');

-- CreateEnum
CREATE TYPE "ServicoUnidade" AS ENUM ('HECTARE', 'HORA', 'DIARIA', 'PROJETO', 'UNIDADE');

-- CreateEnum
CREATE TYPE "ProjetoTipo" AS ENUM ('DRONE', 'AMBIENTAL', 'IRRIGACAO', 'CONSULTORIA', 'OUTRO');

-- CreateEnum
CREATE TYPE "ProjetoStatus" AS ENUM ('PLANEJAMENTO', 'EM_ANDAMENTO', 'PAUSADO', 'CONCLUIDO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "FinanceiroStatus" AS ENUM ('ABERTO', 'PARCIALMENTE_RECEBIDO', 'RECEBIDO', 'VENCIDO', 'CANCELADO', 'RENEGOCIADO');

-- CreateEnum
CREATE TYPE "FormaPagamento" AS ENUM ('PIX', 'DINHEIRO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'TRANSFERENCIA', 'BOLETO', 'CHEQUE', 'OUTROS');

-- CreateEnum
CREATE TYPE "CategoriaDespesa" AS ENUM ('INSUMO', 'COMBUSTIVEL', 'MANUTENCAO', 'EQUIPAMENTO', 'SERVICO_TERCEIRO', 'IMPOSTO', 'TRANSPORTE', 'ADMINISTRATIVO', 'OUTROS');

-- CreateTable
CREATE TABLE "Pessoa" (
    "id" TEXT NOT NULL,
    "tipo" "PessoaTipo" NOT NULL,
    "cpfCnpj" TEXT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "email" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pessoa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Propriedade" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "PropriedadeTipo" NOT NULL,
    "matricula" TEXT,
    "areaTotalHa" DOUBLE PRECISION,
    "cidade" TEXT,
    "estado" TEXT,
    "endereco" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Propriedade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AreaPropriedade" (
    "id" TEXT NOT NULL,
    "propriedadeId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "AreaTipo" NOT NULL,
    "areaHa" DOUBLE PRECISION,
    "culturaAtual" TEXT,
    "descricao" TEXT,
    "latitudeCentro" DOUBLE PRECISION,
    "longitudeCentro" DOUBLE PRECISION,
    "coordenadasGeoJson" JSONB,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AreaPropriedade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicoCatalogo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "ServicoTipo" NOT NULL,
    "descricao" TEXT,
    "valorPadrao" DOUBLE PRECISION,
    "unidade" "ServicoUnidade" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicoCatalogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Projeto" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "propriedadeId" TEXT,
    "servicoCatalogoId" TEXT,
    "nome" TEXT NOT NULL,
    "tipo" "ProjetoTipo" NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "status" "ProjetoStatus" NOT NULL DEFAULT 'PLANEJAMENTO',
    "valorPrevisto" DOUBLE PRECISION,
    "valorFechado" DOUBLE PRECISION,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Projeto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjetoArea" (
    "id" TEXT NOT NULL,
    "projetoId" TEXT NOT NULL,
    "areaPropriedadeId" TEXT NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjetoArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServicoExecutado" (
    "id" TEXT NOT NULL,
    "projetoAreaId" TEXT NOT NULL,
    "dataExecucao" TIMESTAMP(3) NOT NULL,
    "areaExecutadaHa" DOUBLE PRECISION,
    "produtoAplicado" TEXT,
    "doseAplicada" TEXT,
    "valorExecutado" DECIMAL(15,2) NOT NULL,
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServicoExecutado_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaReceber" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "projetoId" TEXT,
    "servicoExecutadoId" TEXT,
    "numeroDocumento" TEXT,
    "descricao" TEXT NOT NULL,
    "competencia" TIMESTAMP(3),
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valorOriginal" DECIMAL(15,2) NOT NULL,
    "valorDesconto" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorJuros" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorMulta" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorRecebido" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorAberto" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "FinanceiroStatus" NOT NULL DEFAULT 'ABERTO',
    "formaPagamento" "FormaPagamento" DEFAULT 'PIX',
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContaReceber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recebimento" (
    "id" TEXT NOT NULL,
    "contaReceberId" TEXT NOT NULL,
    "dataRecebimento" TIMESTAMP(3) NOT NULL,
    "valorRecebido" DECIMAL(15,2) NOT NULL,
    "valorJuros" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorMulta" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorDesconto" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "formaRecebimento" "FormaPagamento" NOT NULL,
    "contaBancoId" TEXT,
    "comprovanteUrl" TEXT,
    "numeroReferencia" TEXT,
    "observacoes" TEXT,
    "estornado" BOOLEAN NOT NULL DEFAULT false,
    "dataEstorno" TIMESTAMP(3),
    "motivoEstorno" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recebimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContaPagar" (
    "id" TEXT NOT NULL,
    "fornecedorId" TEXT NOT NULL,
    "projetoId" TEXT,
    "numeroDocumento" TEXT,
    "descricao" TEXT NOT NULL,
    "competencia" TIMESTAMP(3),
    "dataEmissao" TIMESTAMP(3) NOT NULL,
    "dataVencimento" TIMESTAMP(3) NOT NULL,
    "valorOriginal" DECIMAL(15,2) NOT NULL,
    "valorDesconto" DECIMAL(15,2) NOT NULL,
    "valorJuros" DECIMAL(15,2) NOT NULL,
    "valorMulta" DECIMAL(15,2) NOT NULL,
    "valorPago" DECIMAL(15,2) NOT NULL,
    "valorAberto" DECIMAL(15,2) NOT NULL,
    "status" "FinanceiroStatus" NOT NULL DEFAULT 'ABERTO',
    "formaPagamento" "FormaPagamento",
    "categoria" "CategoriaDespesa",
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ContaPagar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pagamento" (
    "id" TEXT NOT NULL,
    "contaPagarId" TEXT NOT NULL,
    "dataPagamento" TIMESTAMP(3) NOT NULL,
    "valorRecebido" DECIMAL(15,2) NOT NULL,
    "valorJuros" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorMulta" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "valorDesconto" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "formaPagamento" "FormaPagamento" NOT NULL,
    "contaBancoId" TEXT,
    "comprovanteUrl" TEXT,
    "numeroReferencia" TEXT,
    "observacoes" TEXT,
    "estornado" BOOLEAN NOT NULL DEFAULT false,
    "dataEstorno" TIMESTAMP(3),
    "motivoEstorno" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjetoArea_projetoId_areaPropriedadeId_key" ON "ProjetoArea"("projetoId", "areaPropriedadeId");

-- AddForeignKey
ALTER TABLE "Propriedade" ADD CONSTRAINT "Propriedade_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaPropriedade" ADD CONSTRAINT "AreaPropriedade_propriedadeId_fkey" FOREIGN KEY ("propriedadeId") REFERENCES "Propriedade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_propriedadeId_fkey" FOREIGN KEY ("propriedadeId") REFERENCES "Propriedade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Projeto" ADD CONSTRAINT "Projeto_servicoCatalogoId_fkey" FOREIGN KEY ("servicoCatalogoId") REFERENCES "ServicoCatalogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetoArea" ADD CONSTRAINT "ProjetoArea_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjetoArea" ADD CONSTRAINT "ProjetoArea_areaPropriedadeId_fkey" FOREIGN KEY ("areaPropriedadeId") REFERENCES "AreaPropriedade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServicoExecutado" ADD CONSTRAINT "ServicoExecutado_projetoAreaId_fkey" FOREIGN KEY ("projetoAreaId") REFERENCES "ProjetoArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_servicoExecutadoId_fkey" FOREIGN KEY ("servicoExecutadoId") REFERENCES "ServicoExecutado"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recebimento" ADD CONSTRAINT "Recebimento_contaReceberId_fkey" FOREIGN KEY ("contaReceberId") REFERENCES "ContaReceber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "Pessoa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_projetoId_fkey" FOREIGN KEY ("projetoId") REFERENCES "Projeto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_contaPagarId_fkey" FOREIGN KEY ("contaPagarId") REFERENCES "ContaPagar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
