import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>
}

//Listar título específico do Contas a Pagar
export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const titulo = await prisma.contaPagar.findUnique({
            where: {
                id,
            },
            include: {
                fornecedor: true
            }
        });

        if (!titulo) {
            return NextResponse.json(
                { error: "Título não localizado!" },
                { status: 404 }
            )
        };

        return NextResponse.json(titulo);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao localizar o título do Contas a Pagar!" },
            { status: 500 }
        )
    }
}

//Atualizar um título de Contas a Pagar
export async function PUT(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const tituloExiste = await prisma.contaPagar.findUnique({
            where: {
                id
            }
        });

        if (!tituloExiste) {
            return NextResponse.json(
                { error: "Título não encontrado!" },
                { status: 404 }
            )
        };

        const titulo = await prisma.contaPagar.update({
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

//Cancelar/Inativar um título de Contas a Pagar
export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const tituloExiste = await prisma.contaPagar.findUnique({
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

        //const pagamentoExiste = await prisma.pagamento.findFirst({
        //    where: {
        //        contaPagarId: id,
        //        estornado: false,
        //    }
        //});
        //
        //if (pagamentoExiste) {
        //    return NextResponse.json(
        //        { error: "Não é possível cancelar título com pagamento retgistrado. Estorne o pagamento antes." },
        //        { status: 400 }
        //    )
        //}

        const titulo = await prisma.contaReceber.update({
            where: {
                id
            },
            data: {
                status: "CANCELADO"
            }
        });

        return NextResponse.json(
            {
                message: "Título cancelado com sucesso",
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