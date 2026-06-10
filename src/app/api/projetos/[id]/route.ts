import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>;
}

//Listar Projeto específico
export async function GET(
    request: Request,
    { params }: Params
) {
    try {

        const { id } = await params;

        const projeto = await prisma.projeto.findUnique({
            where: {
                id,
            },
            include: {
                propriedade: {
                    include: {
                        cliente: true,
                        ativo: true
                    }
                }
            }
        });

        if (!projeto) {
            return NextResponse.json(
                { error: "Projeto não encontrado!" },
                { status: 404 }
            )
        };

        return NextResponse.json(projeto)

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao localizar o Projeto" },
            { status: 500 }
        )
    }
}

//Atualizar um projeto
export async function PUT(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const body = await request.json();

        const projetoExistente = await prisma.projeto.findUnique({
            where: {
                id,
            },
        });

        if (!projetoExistente) {
            return NextResponse.json(
                { error: "Projeto não cadastro!" },
                { status: 404 }
            )
        }

        const projeto = await prisma.projeto.update({
            where: {
                id,
            },
            data: {
                nome: body.nome,
                tipo: body.tipo,
                descricao: body.descricao,
                dataInicio: body.dataInicio,
                dataFim: body.dataFim,
                status: body.status,
                valorPrevisto: body.valorPrevisto,
                valorFechado: body.valorFechado
            }
        });

        return NextResponse.json(projeto);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao atualizar o Projeto!" },
            { status: 500 }
        )
    }
}

// Deletar/Inativar um projeto
export async function DELETE(
    request: Request,
    { params }: Params
) {
    try {
        const { id } = await params;

        const projetoExistente = await prisma.projeto.findUnique({
            where: {
                id,
            },
        });

        if (!projetoExistente) {
            return NextResponse.json(
                { error: "Projeto não cadastro!" },
                { status: 404 }
            )
        }

        const projeto = await prisma.projeto.update({
            where: {
                id,
            },
            data: {
                ativo: false
            }
        });

        return NextResponse.json(
            { message: "Projeto inativado com sucesso!", projeto }
        )

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao inativar o projeto" },
            { status: 500 }
        )
    }
}
