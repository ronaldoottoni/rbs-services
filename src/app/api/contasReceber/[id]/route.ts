import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>
}

//Listar Título Específico
export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const titulo = await prisma.contaReceber.findUnique({
            where: {
                id,
            },
            include: {
                cliente: true
            }
        });

        if (!titulo) {
            return NextResponse.json(
                { error: "Título não encontrado!" },
                { status: 404 }
            )
        };

        return NextResponse.json(titulo);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao localizar Título!" },
            { status: 500 }
        )
    }
}

//Atualizar Titulo
export async function PUT(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const tituloExiste = await prisma.contaReceber.findUnique({
            where: {
                id,
            }
        });

        if (!tituloExiste) {
            return NextResponse.json(
                { error: "Título não encontrado!" },
                { status: 404 }
            )
        };

        const titulo = await prisma.contaReceber.update({
            where: {
                id,
            },
            data: {
                numeroDocumento: body.numeroDocumento || null,
                descricao: body.descricao,
                competencia: body.competencia || null,
                dataVencimento: body.dataVencimento,
                formaPagamento: body.formaPagamento || null,
                observacoes: body.observacoes || null,
            }
        });

        return NextResponse.json(titulo);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao atualizar título!" },
            { status: 500 }
        )
    }
}

//Cancelar/Inativar um Título do Contas a Receber
export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const tituloExiste = await prisma.contaReceber.findUnique({
            where: {
                id,
            }
        });

        if (!tituloExiste) {
            return NextResponse.json(
                { error: "Título não encontrado!" },
                { status: 404 }
            )
        };

        const recebimentoExiste = await prisma.recebimento.findFirst({
            where: {
                contaReceberId: id,
                estornado: false,
            }
        })

        if (recebimentoExiste) {
            return NextResponse.json(
                { error: "Não é possível cancelar título com recebimento registrado. Estorne o recebimento antes." },
                { status: 400 }
            )
        }

        const titulo = await prisma.contaReceber.update({
            where: {
                id
            },
            data: {
                status: "CANCELADO"
            }
        })

        return NextResponse.json(
            {
                message: "Titulo cancelado com sucesso",
                titulo
            }
        );

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao cancelar Título!" },
            { status: 500 }
        )
    }
}