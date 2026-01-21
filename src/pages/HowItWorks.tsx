import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  MousePointerClick,
  Search,
  AlertTriangle,
  ArrowLeftRight,
} from 'lucide-react'

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Guia Estoque Classe 2</h1>
        <p className="text-muted-foreground">
          Instruções operacionais para gestão de armazém.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <MousePointerClick className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">1. Ruas</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Gerencie Ruas e Locais. Clique em uma rua para ver detalhes.
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">2. Cores</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <strong>Verde:</strong> Local Ocupado (Material presente).
            <br />
            <strong>Vermelho:</strong> Local Vazio (Disponível).
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <ArrowLeftRight className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">3. Movimento</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Use "Entrada/Saída" para registrar TRP e TRD.
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Qual a diferença entre TRP e TRD?
              </AccordionTrigger>
              <AccordionContent>
                <strong>TRP (Entrada):</strong> Material que chegou mas ainda
                não foi alocado a um local específico. Fica na Zona Virtual.
                <br />
                <strong>TRD (Rua):</strong> Material alocado em uma localização
                física específica (Rua/Prédio).
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Como adicionar uma nova rua ou local?
              </AccordionTrigger>
              <AccordionContent>
                No Dashboard, use o botão "Nova Rua". Dentro da Rua, use
                "Adicionar Prédio/Local".
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                Como dar baixa em um material?
              </AccordionTrigger>
              <AccordionContent>
                Vá em "Entrada/Saída", aba "Registrar Saída". Apenas materiais
                TRD podem ser baixados.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>
                O que significam as cores Verde e Vermelho?
              </AccordionTrigger>
              <AccordionContent>
                O sistema usa estritamente Verde para indicar que há material no
                local (Ocupado) e Vermelho para indicar que o local está vazio.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
