import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

//Listar Áreas de um Projeto específico
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        const projetoId = searchParams.get("projetoId");

        if (!projetoId) {
            return NextResponse.json(
                { error: "Informe o código do Projeto (projetoId)" },
                { status: 400 }
            )
        };

        const areas = await prisma.projetoArea.findMany({
            where: {
                projetoId,
            },
            include: {
                areaPropriedade: {
                    include: {
                        propriedade: {
                            include: {
                                cliente: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                areaPropriedade: {
                    nome: "asc"
                }
            }
        })

        return NextResponse.json(areas);

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao localizar as áreas do Projeto " },
            { status: 500 }
        )
    }
}

//Criar uma área de um projeto
export async function POST(request: Request) {
    try {
        const body = await request.json();

        const projetoArea = await prisma.projetoArea.create({
            data: {
                projetoId: body.projetoId,
                areaPropriedadeId: body.areaPropriedadeId,
                observacoes: body.observacoes
            }
        })

        return NextResponse.json(projetoArea, { status: 201 });

    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { error: "Erro ao cadastrar a área no projeto" },
            { status: 500 }
        )
    }
}