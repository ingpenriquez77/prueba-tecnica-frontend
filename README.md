# 🖥️ Prueba Técnica - Sistema de Gestión (Frontend)

![Angular](https://img.shields.io/badge/Angular-17.0.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-Clean_Modular-brightgreen?style=for-the-badge)

Esta es la aplicación Frontend desarrollada en **Angular** como parte de la evaluación técnica. El sistema implementa una arquitectura modular adaptativa utilizando **Componentes Standalone** combinados con estrategias de renderizado eficientes, proporcionando una Single Page Application (SPA) robusta, segura y altamente reactiva.

---

## 🚀 Características Clave y Arquitectura
* **Clean & Modular Architecture:** Separación estricta de responsabilidades dividida en módulos de negocio (`Modules`), utilidades transversales (`Shared`) y el núcleo operativo (`Core`).
* **Estrategia de Renderizado OnPush:** Implementación de `ChangeDetectionStrategy.OnPush` combinada con ciclos controlados mediante `ChangeDetectorRef` para minimizar los ciclos de renderizado innecesarios y optimizar el rendimiento de la interfaz.
* **Seguridad y Control de Accesos:** Sistema de navegación blindado mediante `AuthGuards` y un flujo dinámico de validación de roles consumido desde las bitácoras NoSQL expuestas por el backend.
* **Bypass Inteligente de Datos:** Mecanismo de contingencia en formularios de auto-perfil protegido para garantizar la continuidad operativa e interactividad visual del usuario, sincronizándose con la caché segura del `localStorage`.

---

## 🛠️ Requisitos Previos
Asegúrate de tener instalado en tu entorno local:
* **Node.js:** Versión v18.x o superior.
* **Angular CLI:** Versión v17.x o superior (Instalable globalmente mediante `npm install -g @angular/cli`).

---

## 📦 Guía Rápida de Instalación y Ejecución

Ejecuta la siguiente secuencia completa de comandos en tu terminal para clonar, configurar e inicializar el servidor local:

```bash
# 1. Clonar el repositorio del frontend
git clone https://github.com/ingpenriquez77/prueba-tecnica-frontend.git

# 2. Acceder al directorio del proyecto
cd prueba-tecnica-frontend

# 3. Instalar la totalidad de dependencias requeridas de Node
npm install

# 4. Levantar el servidor de desarrollo local de Angular (abre el navegador automáticamente)
ng serve -o
