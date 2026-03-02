from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import yaml
import json
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from collections import defaultdict
import jsonschema

app = FastAPI(title="Sensa Catalog API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CATALOG_PATH = Path(__file__).parent.parent.parent / "sensa-catalog"
SCHEMAS_PATH = CATALOG_PATH / "schemas"

class CatalogStats(BaseModel):
    total_entities: int
    by_kind: Dict[str, int]
    validation_status: str

class Entity(BaseModel):
    kind: str
    name: str
    data: Dict[str, Any]

class ValidationResult(BaseModel):
    valid: bool
    errors: List[str]
    warnings: List[str]

class DependencyGraph(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]

def load_entities() -> Dict[str, Dict[str, dict]]:
    """Carrega todas as entidades do catálogo."""
    entities = defaultdict(dict)
    
    entity_dirs = {
        'TopDomain': 'top-domains',
        'Domain': 'domains',
        'SubDomain': 'subdomains',
        'System': 'systems',
        'Component': 'components',
        'Repository': 'repositories',
        'Group': 'groups',
        'User': 'users'
    }
    
    for kind, dir_name in entity_dirs.items():
        dir_path = CATALOG_PATH / dir_name
        if dir_path.exists():
            for yaml_file in dir_path.glob('*.yaml'):
                try:
                    with open(yaml_file, 'r') as f:
                        entity = yaml.safe_load(f)
                    name = entity.get('metadata', {}).get('name')
                    if name:
                        entities[kind][name] = entity
                except Exception as e:
                    print(f"Error loading {yaml_file}: {e}")
    
    return entities

def validate_entity(entity: dict) -> ValidationResult:
    """Valida uma entidade contra seu schema."""
    errors = []
    warnings = []
    
    kind = entity.get('kind')
    if not kind:
        errors.append("Missing 'kind' field")
        return ValidationResult(valid=False, errors=errors, warnings=warnings)
    
    schema_file = SCHEMAS_PATH / f"{kind.lower()}.schema.json"
    if not schema_file.exists():
        warnings.append(f"No schema found for kind: {kind}")
        return ValidationResult(valid=True, errors=errors, warnings=warnings)
    
    try:
        with open(schema_file, 'r') as f:
            schema = json.load(f)
        
        jsonschema.validate(entity, schema)
        return ValidationResult(valid=True, errors=errors, warnings=warnings)
    except jsonschema.ValidationError as e:
        errors.append(str(e.message))
        return ValidationResult(valid=False, errors=errors, warnings=warnings)
    except Exception as e:
        errors.append(f"Validation error: {str(e)}")
        return ValidationResult(valid=False, errors=errors, warnings=warnings)

def build_dependency_graph(entities: Dict[str, Dict[str, dict]]) -> DependencyGraph:
    """Constrói grafo de dependências entre componentes."""
    nodes = []
    edges = []
    
    components = entities.get('Component', {})
    systems = entities.get('System', {})
    
    # Adicionar nós (componentes)
    for name, component in components.items():
        spec = component.get('spec', {})
        nodes.append({
            'id': name,
            'label': spec.get('displayName', name),
            'type': spec.get('type', 'other'),
            'system': spec.get('system'),
            'lifecycle': spec.get('lifecycle', 'unknown'),
            'owner': spec.get('owner')
        })
    
    # Adicionar arestas (dependências)
    for name, component in components.items():
        depends_on = component.get('spec', {}).get('dependsOn', [])
        for dep in depends_on:
            dep_component = dep.get('component')
            if dep_component:
                edges.append({
                    'source': name,
                    'target': dep_component,
                    'type': dep.get('type', 'hard'),
                    'reason': dep.get('reason', '')
                })
    
    return DependencyGraph(nodes=nodes, edges=edges)

@app.get("/")
async def root():
    """Health check."""
    return {"status": "ok", "service": "Sensa Catalog API"}

@app.get("/api/stats", response_model=CatalogStats)
async def get_stats():
    """Retorna estatísticas do catálogo."""
    entities = load_entities()
    
    total = sum(len(v) for v in entities.values())
    by_kind = {k: len(v) for k, v in entities.items()}
    
    return CatalogStats(
        total_entities=total,
        by_kind=by_kind,
        validation_status="ok"
    )

@app.get("/api/entities/{kind}")
async def get_entities_by_kind(kind: str):
    """Lista todas as entidades de um tipo específico."""
    entities = load_entities()
    
    if kind not in entities:
        raise HTTPException(status_code=404, detail=f"Kind '{kind}' not found")
    
    result = []
    for name, entity in entities[kind].items():
        result.append({
            'name': name,
            'displayName': entity.get('spec', {}).get('displayName', name),
            'owner': entity.get('spec', {}).get('owner'),
            'description': entity.get('metadata', {}).get('annotations', {}).get('sensa.io/description'),
            'data': entity
        })
    
    return result

@app.get("/api/entities/{kind}/{name}")
async def get_entity(kind: str, name: str):
    """Retorna uma entidade específica."""
    entities = load_entities()
    
    if kind not in entities:
        raise HTTPException(status_code=404, detail=f"Kind '{kind}' not found")
    
    if name not in entities[kind]:
        raise HTTPException(status_code=404, detail=f"Entity '{name}' not found")
    
    entity = entities[kind][name]
    validation = validate_entity(entity)
    
    return {
        'entity': entity,
        'validation': validation
    }

@app.get("/api/hierarchy")
async def get_hierarchy():
    """Retorna a hierarquia completa do catálogo."""
    entities = load_entities()
    
    hierarchy = []
    
    # TopDomains
    for td_name, td in entities.get('TopDomain', {}).items():
        td_node = {
            'kind': 'TopDomain',
            'name': td_name,
            'displayName': td.get('spec', {}).get('displayName', td_name),
            'owner': td.get('spec', {}).get('owner'),
            'domains': []
        }
        
        # Domains
        for d_name, d in entities.get('Domain', {}).items():
            if d.get('spec', {}).get('topDomain') == td_name:
                d_node = {
                    'kind': 'Domain',
                    'name': d_name,
                    'displayName': d.get('spec', {}).get('displayName', d_name),
                    'owner': d.get('spec', {}).get('owner'),
                    'subdomains': [],
                    'systems': []
                }
                
                # SubDomains
                for sd_name, sd in entities.get('SubDomain', {}).items():
                    if sd.get('spec', {}).get('domain') == d_name:
                        sd_node = {
                            'kind': 'SubDomain',
                            'name': sd_name,
                            'displayName': sd.get('spec', {}).get('displayName', sd_name),
                            'owner': sd.get('spec', {}).get('owner'),
                            'systems': []
                        }
                        
                        # Systems in SubDomain
                        for s_name, s in entities.get('System', {}).items():
                            if s.get('spec', {}).get('subdomain') == sd_name:
                                s_node = {
                                    'kind': 'System',
                                    'name': s_name,
                                    'displayName': s.get('spec', {}).get('displayName', s_name),
                                    'owner': s.get('spec', {}).get('owner'),
                                    'lifecycle': s.get('spec', {}).get('lifecycle'),
                                    'components': []
                                }
                                
                                # Components
                                for c_name, c in entities.get('Component', {}).items():
                                    if c.get('spec', {}).get('system') == s_name:
                                        c_node = {
                                            'kind': 'Component',
                                            'name': c_name,
                                            'displayName': c.get('spec', {}).get('displayName', c_name),
                                            'type': c.get('spec', {}).get('type'),
                                            'lifecycle': c.get('spec', {}).get('lifecycle'),
                                            'owner': c.get('spec', {}).get('owner')
                                        }
                                        s_node['components'].append(c_node)
                                
                                sd_node['systems'].append(s_node)
                        
                        d_node['subdomains'].append(sd_node)
                
                # Systems directly in Domain (without SubDomain)
                for s_name, s in entities.get('System', {}).items():
                    if s.get('spec', {}).get('domain') == d_name and not s.get('spec', {}).get('subdomain'):
                        s_node = {
                            'kind': 'System',
                            'name': s_name,
                            'displayName': s.get('spec', {}).get('displayName', s_name),
                            'owner': s.get('spec', {}).get('owner'),
                            'lifecycle': s.get('spec', {}).get('lifecycle'),
                            'components': []
                        }
                        
                        # Components
                        for c_name, c in entities.get('Component', {}).items():
                            if c.get('spec', {}).get('system') == s_name:
                                c_node = {
                                    'kind': 'Component',
                                    'name': c_name,
                                    'displayName': c.get('spec', {}).get('displayName', c_name),
                                    'type': c.get('spec', {}).get('type'),
                                    'lifecycle': c.get('spec', {}).get('lifecycle'),
                                    'owner': c.get('spec', {}).get('owner')
                                }
                                s_node['components'].append(c_node)
                        
                        d_node['systems'].append(s_node)
                
                td_node['domains'].append(d_node)
        
        hierarchy.append(td_node)
    
    return hierarchy

@app.get("/api/dependencies", response_model=DependencyGraph)
async def get_dependencies():
    """Retorna o grafo de dependências entre componentes."""
    entities = load_entities()
    return build_dependency_graph(entities)

@app.get("/api/search")
async def search(q: str):
    """Busca entidades por nome ou descrição."""
    entities = load_entities()
    results = []
    
    q_lower = q.lower()
    
    for kind, items in entities.items():
        for name, entity in items.items():
            if q_lower in name.lower():
                results.append({
                    'kind': kind,
                    'name': name,
                    'displayName': entity.get('spec', {}).get('displayName', name),
                    'description': entity.get('metadata', {}).get('annotations', {}).get('sensa.io/description'),
                    'match': 'name'
                })
            else:
                desc = entity.get('metadata', {}).get('annotations', {}).get('sensa.io/description', '')
                if q_lower in desc.lower():
                    results.append({
                        'kind': kind,
                        'name': name,
                        'displayName': entity.get('spec', {}).get('displayName', name),
                        'description': desc,
                        'match': 'description'
                    })
    
    return results[:50]  # Limitar a 50 resultados

@app.get("/api/groups")
async def get_groups():
    """Lista todos os grupos com seus membros."""
    entities = load_entities()
    groups = entities.get('Group', {})
    users = entities.get('User', {})
    
    result = []
    for name, group in groups.items():
        spec = group.get('spec', {})
        members_data = []
        
        for member_name in spec.get('members', []):
            if member_name in users:
                user = users[member_name]
                members_data.append({
                    'name': member_name,
                    'displayName': user.get('spec', {}).get('displayName', member_name),
                    'email': user.get('spec', {}).get('email')
                })
        
        result.append({
            'name': name,
            'displayName': spec.get('displayName', name),
            'type': spec.get('type'),
            'members': members_data,
            'contact': spec.get('contact', {}),
            'description': group.get('metadata', {}).get('annotations', {}).get('sensa.io/description')
        })
    
    return result

@app.get("/api/components/by-lifecycle")
async def get_components_by_lifecycle():
    """Agrupa componentes por lifecycle."""
    entities = load_entities()
    components = entities.get('Component', {})
    
    by_lifecycle = defaultdict(list)
    
    for name, component in components.items():
        lifecycle = component.get('spec', {}).get('lifecycle', 'unknown')
        by_lifecycle[lifecycle].append({
            'name': name,
            'displayName': component.get('spec', {}).get('displayName', name),
            'type': component.get('spec', {}).get('type'),
            'system': component.get('spec', {}).get('system'),
            'owner': component.get('spec', {}).get('owner')
        })
    
    return dict(by_lifecycle)

@app.get("/api/validate")
async def validate_catalog():
    """Valida todo o catálogo."""
    entities = load_entities()
    results = {
        'total': 0,
        'valid': 0,
        'invalid': 0,
        'errors': []
    }
    
    for kind, items in entities.items():
        for name, entity in items.items():
            results['total'] += 1
            validation = validate_entity(entity)
            
            if validation.valid:
                results['valid'] += 1
            else:
                results['invalid'] += 1
                results['errors'].append({
                    'kind': kind,
                    'name': name,
                    'errors': validation.errors
                })
    
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
