import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { FinanceiroStatus } from "@prisma/client";

// Listar contas a pagar
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const fornecedorId = searchParams.get("fornecedorId");
        const projetoId = searchParams.get("projetoId");
        const vencimentoIni = searchParams.get("vencimentoIni");
        const vencimentoFin = searchParams.get("vencimentoFin");
        const flagCancelados = searchParams.get("flagCancelados");

        const statusParam = searchParams.get("status");

        if (
            statusParam &&
            !Object.values(FinanceiroStatus).includes(
                statusParam as FinanceiroStatus
            )
        ) {
            return NextResponse.json(
                { error: "Status inválido" },
                { status: 400 }
            );
        }

        const status = statusParam as FinanceiroStatus | null;

        const dataVencimentoInicial = vencimentoIni
            ? new Date(`${vencimentoIni}T00:00:00.000`)
            : null;

        const dataVencimentoFinal = vencimentoFin
            ? new Date(`${vencimentoFin}T23:59:59.999`)
            : null;

        if (
            dataVencimentoInicial &&
            Number.isNaN(dataVencimentoInicial.getTime())
        ) {
            return NextResponse.json(
                { error: "Data inicial de vencimento inválida" },
                { status: 400 }
            );
        }

        if (
            dataVencimentoFinal &&
            Number.isNaN(dataVencimentoFinal.getTime())
        ) {
            return NextResponse.json(
                { error: "Data final de vencimento inválida" },
                { status: 400 }
            );
        }

        if (
            dataVencimentoInicial &&
            dataVencimentoFinal &&
            dataVencimentoInicial > dataVencimentoFinal
        ) {
            return NextResponse.json(
                {
                    error:
                        "A data inicial não pode ser maior que a data final",
                },
                { status: 400 }
            );
        }

        const contasPagar = await prisma.contaPagar.findMany({
            where: {
                ativo: true,

                ...(fornecedorId && { fornecedorId }),
                ...(projetoId && { projetoId }),

                ...(status
                    ? { status }
                    : flagCancelados !== "true"
                      ? {
                            status: {
                                not: FinanceiroStatus.CANCELADO,
                            },
                        }
                      : {}),

                ...(dataVencimentoInicial || dataVencimentoFinal
                    ? {
                          dataVencimento: {
                              ...(dataVencimentoInicial && {
                                  gte: dataVencimentoInicial,
                              }),
                              ...(dataVencimentoFinal && {
                                  lte: dataVencimentoFinal,
                              }),
                          },
                      }
                    : {}),
            },

            orderBy: {
                dataVencimento: "asc",
            },

            include: {
                fornecedor: true,
                projeto: true,
                servicoExecutado: true,
                pagamento: true,
            },
        });

        return NextResponse.json(contasPagar);
    } catch (error) {
        console.error("Erro ao listar contas a pagar:", error);

        return NextResponse.json(
            { error: "Erro ao listar contas a pagar" },
            { status: 500 }
        );
    }
}

// Criar uma conta a pagar
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.fornecedorId) {
            return NextResponse.json(
                { error: "Informe o fornecedor" },
                { status: 400 }
            );
        }

        if (!body.descricao?.trim()) {
            return NextResponse.json(
                { error: "Informe a descrição" },
                { status: 400 }
            );
        }

        if (!body.dataEmissao) {
            return NextResponse.json(
                { error: "Informe a data de emissão" },
                { status: 400 }
            );
        }

        if (!body.dataVencimento) {
            return NextResponse.json(
                { error: "Informe a data de vencimento" },
                { status: 400 }
            );
        }

        const valorOriginal = Number(body.valorOriginal);
        const valorDesconto = Number(body.valorDesconto || 0);
        const valorJuros = Number(body.valorJuros || 0);
        const valorMulta = Number(body.valorMulta || 0);

        if (!Number.isFinite(valorOriginal) || valorOriginal <= 0) {
            return NextResponse.json(
                { error: "O valor original deve ser maior que zero" },
                { status: 400 }
            );
        }

        if (
            !Number.isFinite(valorDesconto) ||
            valorDesconto < 0 ||
            !Number.isFinite(valorJuros) ||
            valorJuros < 0 ||
            !Number.isFinite(valorMulta) ||
            valorMulta < 0
        ) {
            return NextResponse.json(
                {
                    error:
                        "Desconto, juros e multa não podem ser negativos",
                },
                { status: 400 }
            );
        }

        const valorAberto =
            valorOriginal +
            valorJuros +
            valorMulta -
            valorDesconto;

        if (valorAberto <= 0) {
            return NextResponse.json(
                {
                    error:
                        "O valor em aberto deve ser maior que zero",
                },
                { status: 400 }
            );
        }

        const dataEmissao = new Date(body.dataEmissao);
        const dataVencimento = new Date(body.dataVencimento);
        const competencia = body.competencia
            ? new Date(body.competencia)
            : null;

        if (Number.isNaN(dataEmissao.getTime())) {
            return NextResponse.json(
                { error: "Data de emissão inválida" },
                { status: 400 }
            );
        }

        if (Number.isNaN(dataVencimento.getTime())) {
            return NextResponse.json(
                { error: "Data de vencimento inválida" },
                { status: 400 }
            );
        }

        if (
            competencia &&
            Number.isNaN(competencia.getTime())
        ) {
            return NextResponse.json(
                { error: "Competência inválida" },
                { status: 400 }
            );
        }

        const fornecedor = await prisma.pessoa.findFirst({
            where: {
                id: body.fornecedorId,
                ativo: true,
            },
            select: {
                id: true,
            },
        });

        if (!fornecedor) {
            return NextResponse.json(
                { error: "Fornecedor não encontrado" },
                { status: 404 }
            );
        }

        if (body.projetoId) {
            const projeto = await prisma.projeto.findFirst({
                where: {
                    id: body.projetoId,
                    ativo: true,
                },
                select: {
                    id: true,
                },
            });

            if (!projeto) {
                return NextResponse.json(
                    { error: "Projeto não encontrado" },
                    { status: 404 }
                );
            }
        }

        const contaPagar = await prisma.contaPagar.create({
            data: {
                fornecedorId: body.fornecedorId,
                projetoId: body.projetoId || null,
                numeroDocumento: body.numeroDocumento?.trim() || null,
                descricao: body.descricao.trim(),
                competencia,
                dataEmissao,
                dataVencimento,
                valorOriginal,
                valorDesconto,
                valorJuros,
                valorMulta,
                valorPago: 0,
                valorAberto,
                status: FinanceiroStatus.ABERTO,
                formaPagamento: body.formaPagamento || null,
                categoria: body.categoria || null,
                observacoes: body.observacoes?.trim() || null,
            },
            include: {
                fornecedor: true,
                projeto: true,
            },
        });

        return NextResponse.json(contaPagar, {
            status: 201,
        });
    } catch (error) {
        console.error("Erro ao criar conta a pagar:", error);

        return NextResponse.json(
            { error: "Erro ao criar a conta a pagar" },
            { status: 500 }
        );
    }
}