import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
        recebimentoId: string;
    }>
}

//Registrar estorno de Pagamento
export async function POST(
    request: Request,
    { params }: Params
) {
    try {
        const { id, recebimentoId } = await params;

        const body = await request.json();

        if (!body.motivoEstorno) {
            return NextResponse.json(
                { error: "Informe o motivo do estorno" },
                { status: 400 }
            )
        };

        const recebimentoExiste = await prisma.recebimento.findFirst({
            where: {
                id: recebimentoId,
                contaReceberId: id
            }
        });

        if (!recebimentoExiste) {
            return NextResponse.json(
                { error: "Recebimento não localizado" },
                { status: 404 }
            )
        };
        if (recebimentoExiste.estornado) {
            return NextResponse.json(
                { error: "Recebimento já foi estornado!" },
                { status: 400 }
            )
        };

        const resultado = await prisma.$transaction(async (tx) => {
            const recebimentoEstornado = await tx.recebimento.update({
                where: {
                    id: recebimentoId,
                },
                data: {
                    estornado: true,
                    dataEstorno: new Date(),
                    motivoEstorno: body.motivoEstorno
                },
            });

            const titulo = await tx.contaReceber.findUnique({
                where: {
                    id,
                },
            })

            if (!titulo) {
                throw new Error("Título não encontrado");
            }

            const totais = await tx.recebimento.aggregate({
                where: {
                    contaReceberId: id,
                    estornado: false,
                },
                _sum: {
                    valorRecebido: true,
                    valorJuros: true,
                    valorMulta: true,
                    valorDesconto: true,
                },
            });

            const valorRecebido = Number(totais._sum.valorRecebido || 0);
            const valorJuros = Number(totais._sum.valorJuros || 0);
            const valorMulta = Number(totais._sum.valorMulta || 0);
            const valorDesconto = Number(totais._sum.valorDesconto || 0);

            const valorOriginal = Number(titulo.valorOriginal);

            const valorTotalTitulo =
                valorOriginal +
                valorJuros +
                valorMulta -
                valorDesconto;

            const valorAbertoCalculado = valorTotalTitulo - valorRecebido;
            const valorAberto = valorAbertoCalculado < 0 ? 0 : valorAbertoCalculado;

            let status: "ABERTO" | "PARCIALMENTE_RECEBIDO" | "RECEBIDO" = "ABERTO";

            if (valorAberto <= 0) {
                status = "RECEBIDO";
            } else if (valorRecebido > 0) {
                status = "PARCIALMENTE_RECEBIDO";
            }

            const tituloAtualizado = await tx.contaReceber.update({
                where: {
                    id
                },
                data: {
                    valorRecebido,
                    valorJuros,
                    valorMulta,
                    valorDesconto,
                    valorAberto,
                    status,
                }
            });

            return {
                recebimentoEstornado,
                tituloAtualizado,
            };
        });

        return NextResponse.json(resultado);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao registrar o estorno do pagamento!" },
            { status: 500 }
        )
    }
}