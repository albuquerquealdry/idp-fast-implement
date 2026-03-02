#!/usr/bin/env python3
"""
Script para validar integridade referencial do catálogo Sensa.
Verifica se todas as referências entre entidades existem.
"""

import os
import sys
import yaml
from pathlib import Path
from collections import defaultdict
from typing import Dict, List, Set, Tuple

class CatalogValidator:
    def __init__(self, catalog_root: str):
        self.catalog_root = Path(catalog_root)
        self.entities: Dict[str, Dict[str, dict]] = defaultdict(dict)
        self.errors: List[str] = []
        self.warnings: List[str] = []
        
    def load_entities(self):
        """Carrega todas as entidades do catálogo."""
        entity_dirs = [
            'top-domains', 'domains', 'subdomains', 'systems',
            'components', 'repositories', 'groups', 'users'
        ]
        
        for entity_dir in entity_dirs:
            dir_path = self.catalog_root / entity_dir
            if not dir_path.exists():
                continue
                
            for yaml_file in dir_path.glob('*.yaml'):
                try:
                    with open(yaml_file, 'r') as f:
                        entity = yaml.safe_load(f)
                        
                    kind = entity.get('kind')
                    name = entity.get('metadata', {}).get('name')
                    
                    if kind and name:
                        self.entities[kind][name] = entity
                        
                except Exception as e:
                    self.errors.append(f"Error loading {yaml_file}: {e}")
    
    def validate_owner_exists(self, entity: dict, entity_name: str) -> bool:
        """Valida se o owner existe."""
        owner = entity.get('spec', {}).get('owner')
        if not owner:
            return True  # Owner pode ser opcional em alguns casos
            
        if owner not in self.entities.get('Group', {}):
            self.errors.append(
                f"{entity.get('kind')} '{entity_name}': "
                f"owner '{owner}' does not exist"
            )
            return False
        return True
    
    def validate_parent_exists(self, entity: dict, entity_name: str) -> bool:
        """Valida se o parent existe."""
        kind = entity.get('kind')
        spec = entity.get('spec', {})
        
        # TopDomain -> Domain
        if kind == 'Domain':
            top_domain = spec.get('topDomain')
            if top_domain and top_domain not in self.entities.get('TopDomain', {}):
                self.errors.append(
                    f"Domain '{entity_name}': "
                    f"topDomain '{top_domain}' does not exist"
                )
                return False
        
        # Domain -> SubDomain
        elif kind == 'SubDomain':
            domain = spec.get('domain')
            if domain and domain not in self.entities.get('Domain', {}):
                self.errors.append(
                    f"SubDomain '{entity_name}': "
                    f"domain '{domain}' does not exist"
                )
                return False
        
        # Domain/SubDomain -> System
        elif kind == 'System':
            domain = spec.get('domain')
            if domain:
                if (domain not in self.entities.get('Domain', {}) and 
                    domain not in self.entities.get('SubDomain', {})):
                    self.errors.append(
                        f"System '{entity_name}': "
                        f"domain '{domain}' does not exist"
                    )
                    return False
        
        # System -> Component
        elif kind == 'Component':
            system = spec.get('system')
            if system and system not in self.entities.get('System', {}):
                self.errors.append(
                    f"Component '{entity_name}': "
                    f"system '{system}' does not exist"
                )
                return False
        
        return True
    
    def validate_dependencies(self, entity: dict, entity_name: str) -> bool:
        """Valida se as dependências existem."""
        if entity.get('kind') != 'Component':
            return True
            
        depends_on = entity.get('spec', {}).get('dependsOn', [])
        valid = True
        
        for dep in depends_on:
            component = dep.get('component')
            if component and component not in self.entities.get('Component', {}):
                self.errors.append(
                    f"Component '{entity_name}': "
                    f"dependency '{component}' does not exist"
                )
                valid = False
        
        return valid
    
    def validate_repository_exists(self, entity: dict, entity_name: str) -> bool:
        """Valida se o repositório existe."""
        if entity.get('kind') != 'Component':
            return True
            
        repo = entity.get('spec', {}).get('repository', {})
        repo_name = repo.get('name')
        
        if repo_name and repo_name not in self.entities.get('Repository', {}):
            self.errors.append(
                f"Component '{entity_name}': "
                f"repository '{repo_name}' does not exist"
            )
            return False
        
        return True
    
    def validate_members_exist(self, entity: dict, entity_name: str) -> bool:
        """Valida se os membros existem."""
        if entity.get('kind') != 'Group':
            return True
            
        members = entity.get('spec', {}).get('members', [])
        valid = True
        
        for member in members:
            if member not in self.entities.get('User', {}):
                self.errors.append(
                    f"Group '{entity_name}': "
                    f"member '{member}' does not exist"
                )
                valid = False
        
        return valid
    
    def validate_user_groups(self, entity: dict, entity_name: str) -> bool:
        """Valida se os grupos do usuário existem."""
        if entity.get('kind') != 'User':
            return True
            
        member_of = entity.get('spec', {}).get('memberOf', [])
        valid = True
        
        for group in member_of:
            if group not in self.entities.get('Group', {}):
                self.errors.append(
                    f"User '{entity_name}': "
                    f"group '{group}' does not exist"
                )
                valid = False
        
        return valid
    
    def detect_circular_dependencies(self) -> bool:
        """Detecta dependências circulares entre componentes."""
        components = self.entities.get('Component', {})
        
        def has_cycle(component: str, visited: Set[str], path: Set[str]) -> bool:
            if component in path:
                return True
            if component in visited:
                return False
                
            visited.add(component)
            path.add(component)
            
            comp_entity = components.get(component, {})
            depends_on = comp_entity.get('spec', {}).get('dependsOn', [])
            
            for dep in depends_on:
                dep_name = dep.get('component')
                if dep_name and has_cycle(dep_name, visited, path):
                    self.errors.append(
                        f"Circular dependency detected involving '{component}'"
                    )
                    return True
            
            path.remove(component)
            return False
        
        visited = set()
        for component in components:
            if component not in visited:
                if has_cycle(component, visited, set()):
                    return False
        
        return True
    
    def validate_all(self) -> bool:
        """Executa todas as validações."""
        print("🔍 Loading catalog entities...")
        self.load_entities()
        
        print(f"📊 Loaded {sum(len(v) for v in self.entities.values())} entities")
        for kind, entities in self.entities.items():
            print(f"   - {kind}: {len(entities)}")
        print()
        
        print("🔍 Validating referential integrity...")
        
        # Validar cada entidade
        for kind, entities in self.entities.items():
            for name, entity in entities.items():
                self.validate_owner_exists(entity, name)
                self.validate_parent_exists(entity, name)
                self.validate_dependencies(entity, name)
                self.validate_repository_exists(entity, name)
                self.validate_members_exist(entity, name)
                self.validate_user_groups(entity, name)
        
        # Detectar dependências circulares
        print("🔍 Checking for circular dependencies...")
        self.detect_circular_dependencies()
        
        return len(self.errors) == 0
    
    def print_results(self):
        """Imprime os resultados da validação."""
        print("\n" + "=" * 50)
        print("📊 Validation Results")
        print("=" * 50)
        
        if self.errors:
            print(f"\n❌ Found {len(self.errors)} error(s):\n")
            for error in self.errors:
                print(f"  • {error}")
        
        if self.warnings:
            print(f"\n⚠️  Found {len(self.warnings)} warning(s):\n")
            for warning in self.warnings:
                print(f"  • {warning}")
        
        if not self.errors and not self.warnings:
            print("\n✅ All referential integrity checks passed!")
        
        print()

def main():
    if len(sys.argv) > 1:
        catalog_root = sys.argv[1]
    else:
        catalog_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    validator = CatalogValidator(catalog_root)
    
    try:
        is_valid = validator.validate_all()
        validator.print_results()
        
        sys.exit(0 if is_valid else 1)
        
    except Exception as e:
        print(f"❌ Validation failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    main()
