import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'

const equipments = [
  {
    id: 1,
    name: 'Empilhadeira Elétrica 01',
    model: 'Toyota 8FBE',
    status: 'available',
    image: 'https://img.usecurling.com/p/300/200?q=forklift&color=yellow',
    operator: null,
  },
  {
    id: 2,
    name: 'Paleteira Manual 05',
    model: 'Standard',
    status: 'in-use',
    image:
      'https://img.usecurling.com/p/300/200?q=hand%20pallet%20truck&color=blue',
    operator: 'Carlos Silva',
  },
  {
    id: 3,
    name: 'Paleteira Elétrica 02',
    model: 'Linde T20',
    status: 'maintenance',
    image: 'https://img.usecurling.com/p/300/200?q=pallet%20jack&color=red',
    operator: null,
  },
]

export default function Equipment() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipamentos</h1>
          <p className="text-muted-foreground">
            Lista de ferramentas operacionais.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipments.map((eq) => (
          <Card
            key={eq.id}
            className="overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="aspect-video w-full overflow-hidden bg-slate-100">
              <img
                src={eq.image}
                alt={eq.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{eq.name}</CardTitle>
                  <CardDescription>{eq.model}</CardDescription>
                </div>
                {eq.status === 'available' && (
                  <Badge className="bg-green-500">Disponível</Badge>
                )}
                {eq.status === 'in-use' && (
                  <Badge
                    variant="secondary"
                    className="bg-yellow-100 text-yellow-800"
                  >
                    Em Uso
                  </Badge>
                )}
                {eq.status === 'maintenance' && (
                  <Badge variant="destructive">Manutenção</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  {eq.status === 'available' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />{' '}
                      Pronto para uso
                    </>
                  ) : eq.status === 'in-use' ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 text-yellow-500" />{' '}
                      Operador: {eq.operator}
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2 text-red-500" />{' '}
                      Indisponível
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
