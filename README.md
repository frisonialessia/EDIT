# EDIT-OS

Sistema operativo de orquestación para eventos de ultra-lujo de **EDIT** — el estudio líder global en la ejecución de experiencias excepcionales, sin importar la ubicación geográfica.

## Visión

EDIT-OS centraliza la planificación, coordinación y ejecución de eventos de ultra-lujo en una plataforma modular y escalable. La tecnología permanece invisible: el equipo se concentra en la excelencia operativa mientras el sistema automatiza la logística de precisión a escala global.

## Arquitectura

Monorepo modular diseñado para crecer con el negocio:

```
edit-os/
├── apps/
│   ├── api/          # Backend — orquestación, integraciones, servicios
│   └── web/          # Frontend — interfaz editorial de operaciones
├── packages/
│   ├── core/         # Dominio, tipos y lógica de negocio compartida
│   ├── ui/           # Sistema de diseño — minimalista, editorial, High Flash
│   └── services/     # Servicios transversales — logística, notificaciones, etc.
└── .cursor/rules/    # ADN y convenciones del proyecto
```

## Principios

- **El lujo está en la simplicidad** — cada módulo y función debe ser necesario y eficiente.
- **Tecnología invisible** — automatizar sin fricción, en cualquier mercado del mundo.
- **Modularidad** — dominio desacoplado, altamente testeable, TypeScript end-to-end.
- **Alcance global** — orquestación unificada para operaciones locales e internacionales.

## Stack

- **Lenguaje:** TypeScript
- **Patrón:** Monorepo (`apps` + `packages`)
- **Filosofía de código:** Limpio, modular, testeable

## Paquetes

| Paquete | Namespace | Descripción |
|---|---|---|
| Core | `@edit-os/core` | Fuente de verdad — tipos y dominio |
| UI | `@edit-os/ui` | Sistema de diseño editorial |
| Services | `@edit-os/services` | Orquestación y repositorios |

---

*EDIT — Where luxury meets precision.*
