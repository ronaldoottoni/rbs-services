import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Params {
    params: Promise<{
        id: string;
    }>;
}

//Listar um Resumo do Projeto
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
                areas: {
                    include: {
                        execucoes: true,
                    },
                },
            },
        });

        if (!projeto) {
            return NextResponse.json(
                { error: "Projeto não localizado" },
                { status: 404 }
            )
        };

        const qtdeAreas = projeto.areas.length;

        const execucoes = projeto.areas.flatMap((area) => area.execucoes);

        const qtdeExecucoes = execucoes.length;

        const totalAreaExecutadaHa = execucoes.reduce((total, execucao) => {
            return total + Number(execucao.areaExecutadaHa ?? 0)
        }, 0);

        const totalValorExecutado = execucoes.reduce((total, execucao) => {
            return total + Number(execucao.valorExecutado ?? 0)
        }, 0);

        return NextResponse.json({
            projetoId: projeto.id,
            nome: projeto.nome,
            status: projeto.status,
            valorPrevisto: projeto.valorPrevisto,
            valorFechado: projeto.valorFechado,
            qtdeAreas,
            qtdeExecucoes,
            totalAreaExecutadaHa,
            totalValorExecutado,
        });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao gerar o resumo do projeto" },
            { status: 500 }
        )
    }
}