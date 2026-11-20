# Skills y herramientas del agente

Criterio: **un núcleo chico y sin superposiciones**, más opcionales por tipo de proyecto. Cada skill de terceros pasa primero por **SkillSpector** antes de instalarse.

> Los comandos de instalación cambian seguido. Si alguno falla, revisá el README del repo indicado.

## Filtro de seguridad (antes de instalar cualquier skill de terceros)

**SkillSpector** (NVIDIA): analiza una skill en busca de prompt injection, exfiltración de datos, patrones maliciosos y dependencias vulnerables; da un puntaje de riesgo y una recomendación (SAFE / CAUTION / DO NOT INSTALL). También expone un servidor MCP para que el agente escanee antes de instalar.

- Repo: https://github.com/NVIDIA/SkillSpector (instalación con `uv tool install` o Docker; ver README).
- Regla: **DO NOT INSTALL → no se instala.** CAUTION → leer el hallazgo antes de decidir.

## Núcleo (todos los proyectos)

| Skill                           | Para qué                                                                                                        | Instalación                                                                                    |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Superpowers**                 | Flujo de trabajo: brainstorm → plan → TDD → debugging sistemático → subagentes.                                 | `/plugin install superpowers@claude-plugins-official`                                          |
| **Context7** (MCP)              | Documentación actualizada de librerías (Hono, Drizzle, Better Auth, TanStack…).                                 | https://github.com/upstash/context7                                                            |
| **Modern Web Guidance**         | Buenas prácticas web vigentes (Chrome, Edge, Firefox, MDN): responsive, rendimiento, formularios, PWA.          | `npx modern-web-guidance@latest install`                                                       |
| **Ponytail**                    | Menos código: reutilizar lo existente y la plataforma antes de escribir; no recorta seguridad ni accesibilidad. | `/plugin marketplace add DietrichGebert/ponytail` → instalar el plugin                         |
| **Security Audit** (Cloudflare) | Auditoría de seguridad por fases con hallazgos verificados. Correrla antes de cada salida a producción.         | `npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit`     |
| **UI UX Pro Max**               | Criterio de UI/UX para web y mobile (React + Tailwind), chequeos de calidad. Requiere Python 3.                 | `npx skills add https://github.com/nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max` |
| **Playwright**                  | Tests e2e (ya incluido en la plantilla) y navegación del agente para verificar pantallas.                       | `@playwright/test` en `apps/web`; CLI del agente: https://github.com/microsoft/playwright-cli  |

Los principios de **Karpathy** (pensar antes, simplicidad, cambios quirúrgicos, criterio verificable) ya están incorporados en el `CLAUDE.md` del proyecto: no hace falta instalarlos.

## Opcionales

| Skill                                                             | Cuándo sumarla                                                                                                                                                                              | Instalación                                                                                      |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| **Elephant-Goldfish Model** (Google)                              | Funcionalidades grandes o críticas: un agente redacta el diseño con todo el contexto y revisores "sin memoria" lo critican antes de codear. Ojo: no trae revisión de seguridad por defecto. | `claude plugin marketplace add google/elephant-goldfish-model` → `claude plugin install egm@egm` |
| **Emil Kowalski — design eng**                                    | Segunda pasada de pulido: animaciones, transiciones, microinteracciones.                                                                                                                    | `npx skills@latest add emilkowalski/skills`                                                      |
| **Taste**                                                         | Landings y páginas públicas con diseño menos genérico (módulo SEO).                                                                                                                         | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"`         |
| **Matt Pocock skills**                                            | Si preferís su flujo (grill-me, to-spec, to-tickets). **No combinar con Superpowers** como flujo principal.                                                                                 | `claude plugin install mattpocock-skills@claude-plugins-official`                                |
| **Anthropic skills** (skill-creator, mcp-builder, webapp-testing) | Crear skills propias, construir servidores MCP.                                                                                                                                             | https://github.com/anthropics/skills                                                             |

## Descartadas (y por qué)

| Skill                                                    | Motivo                                                                                                                                                                                                          |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ECC**                                                  | ~48 agentes y ~180 skills de 12 ecosistemas, reglas que se copian a mano y patrones de Express/Next.js. Se superpone con Superpowers y Ponytail. Su parte de seguridad la cubren SkillSpector + Security Audit. |
| **Harness²** (Google Research)                           | Framework de investigación en Python para benchmarks de agentes, no una herramienta de desarrollo diario.                                                                                                       |
| **Caveman**                                              | Ahorro de tokens con caveats: con sesión iniciada envía prompts a su nube y la telemetría viene activa por defecto. Choca con la prioridad de cuidar los datos.                                                 |
| **Marketing, redes, finanzas, legal, pequeñas empresas** | No son de desarrollo: van en un kit aparte.                                                                                                                                                                     |

## Sin evaluar todavía

Claude-Mem, AI Design Check, Transitions.dev, Loop-Engineering, awesome-harness-engineering. Evaluarlas (con SkillSpector) antes de sumarlas.
