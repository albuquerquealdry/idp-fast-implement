import { useApi } from '../hooks/useApi'
import { api } from '../lib/api'
import { PageHeader } from '../components/layout/PageHeader'
import { Card, CardContent, CardTitle } from '../components/ui/Card'
import { Loading } from '../components/ui/Loading'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Users, Mail, MessageSquare } from 'lucide-react'

function GroupCard({ group }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <CardTitle>{group.displayName}</CardTitle>
            <Badge variant="primary" className="mt-2">{group.type}</Badge>
          </div>
          <Users className="w-6 h-6 text-gray-400" />
        </div>

        <p className="text-sm text-gray-600 mb-4">{group.description}</p>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Membros ({group.members.length})
            </h4>
            <div className="space-y-2">
              {group.members.map(member => (
                <div key={member.name} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                    {member.displayName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{member.displayName}</div>
                    <div className="text-gray-500 text-xs">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {group.contact && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Contato</h4>
              <div className="space-y-2 text-sm">
                {group.contact.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${group.contact.email}`} className="hover:text-blue-600">
                      {group.contact.email}
                    </a>
                  </div>
                )}
                {group.contact.slack && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MessageSquare className="w-4 h-4" />
                    <span>{group.contact.slack}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function Groups() {
  const { data: groups, loading, error } = useApi(() => api.getGroups())

  if (loading) return <Loading />
  if (error) return <Alert variant="error" title="Erro">{error}</Alert>

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Grupos" 
        description={`${groups?.length || 0} grupos cadastrados`}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groups?.map(group => (
          <GroupCard key={group.name} group={group} />
        ))}
      </div>
    </div>
  )
}
