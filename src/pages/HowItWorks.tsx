import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { MousePointerClick, Search, Edit3 } from 'lucide-react'

export default function HowItWorks() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in py-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Como Funciona o Sistema</h1>
        <p className="text-muted-foreground">
          Guia rápido para operadores logísticos.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
              <MousePointerClick className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-lg">1. Navegue</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Selecione a Rua no Dashboard e clique na localização desejada.
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
              <Search className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-lg">2. Identifique</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Verde significa ocupado, Vermelho significa vazio. Use a busca para
            achar itens.
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
              <Edit3 className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-lg">3. Gerencie</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Adicione, mova ou remova paletes clicando nos detalhes da
            localização.
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
                Como mover um palete de lugar?
              </AccordionTrigger>
              <AccordionContent>
                Vá até a localização atual do palete, clique no ícone de "Mover"
                (setas cruzadas) na lista de paletes. Selecione o novo destino
                na lista de locais vazios e confirme.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>O que significam as cores?</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong>Verde:</strong> Localização ocupada (contém
                    material).
                  </li>
                  <li>
                    <strong>Vermelho:</strong> Localização vazia (disponível).
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Como adicionar um novo material?
              </AccordionTrigger>
              <AccordionContent>
                Navegue até uma localização vazia (Vermelha), clique nela e use
                o botão "Adicionar" no topo da lista.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}
