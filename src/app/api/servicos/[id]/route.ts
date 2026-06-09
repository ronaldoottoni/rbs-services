import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>
}

//Listar Serviço pelo id
export async function GET(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const servico = await prisma.servicoCatalogo.findUnique({
            where: {
                id,
            }
        });

        if (!servico) {
            return NextResponse.json(
                { error: "Serviço não encontrado" },
                { status: 404 }
            )
        }

        return NextResponse.json(servico);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao buscar o serviço" },
            { status: 500 }
        )
    }
}

//Atualizar um Serviço pelo id
export async function PUT(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const servicoExistente = await prisma.servicoCatalogo.findUnique({
            where: {
                id,
            }
        });

        if (!servicoExistente) {
            return NextResponse.json(
                { error: "Serviço não encontrado" },
                { status: 404 }
            )
        }

        const servico = await prisma.servicoCatalogo.update({
            where: {
                id,
            },
            data: {
                nome: body.nome,
                tipo: body.tipo,
                descricao: body.descricao,
                valorPadrao: body.valorPadrao,
                unidade: body.unidade,
            }
        });

        return NextResponse.json(servico);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao atualizar o serviço" },
            { status: 500 }
        )
    }
}

//Deletar/Inativar um serviço
export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const servicoExistente = await prisma.servicoCatalogo.findUnique({
            where: {
                id,
            }
        });

        if (!servicoExistente) {
            return NextResponse.json(
                { error: "Serviço não encontrado" },
                { status: 404 }
            )
        }

        const servico = await prisma.servicoCatalogo.update({
            where: {
                id,
            },
            data: {
                ativo: false
            }
        });

        return NextResponse.json(
            {
                message: "Serviço inativado com sucesso",
                servico
            }
        );
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao inativar o serviço" },
            { status: 500 }
        )
    }
}