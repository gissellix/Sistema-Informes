# Sistema-Informes

Sistema destinado al registro, gestión y supervisión de las actividades realizadas durante los turnos del personal policial.

El sistema permite registrar novedades e incidentes, gestionar turnos, generar informes y realizar el seguimiento histórico de las actividades y recorridos GPS asociados a los turnos.

#Descripción

El proyecto tiene como objetivo brindar una herramienta digital para facilitar el registro y la supervisión de las actividades realizadas durante los turnos policiales.

El sistema está compuesto por diferentes módulos que permiten:

- Autenticación y gestión de acceso.
- Inicio y finalización de turnos.
- Registro y edición de novedades.
- Registro de incidentes.
- Registro y procesamiento de audios.
- Generación de informes y documentos PDF.
- Registro y consulta histórica de recorridos GPS.
- Consulta y supervisión de las actividades realizadas.
- Consulta del historial de guardias y reportes.

# Arquitectura

El proyecto está dividido en tres componentes principales:

PPS/

│
├── frontend/          # Aplicación web desarrollada con Angular

│
├── backend-spring/    # Backend principal desarrollado con Spring Boot

│
├── backend-python/    # Servicios desarrollados en Python

│
├── database/    # Base de datos PostgreSQL

│
└── README.md          # Documentación general del proyecto


Cada componente posee su propio archivo README.md, donde se encuentra la documentación específica sobre su instalación, configuración, funcionamiento y dependencias.

📂 Frontend

Desarrollado utilizando Angular.

Se encarga de proporcionar la interfaz web mediante la cual los usuarios interactúan con el sistema.

Para consultar la documentación específica del frontend:

📄 pps-frontend-main/README.md

📂 Backend Spring Boot

Desarrollado utilizando Java y Spring Boot.

Se encarga principalmente de la lógica de negocio, autenticación, gestión de usuarios, comunicación con la base de datos y exposición de los servicios utilizados por el frontend.

Para consultar la documentación específica:

📄  pps-backend-main/README.md

📂 Backend Python

Contiene los servicios desarrollados en Python, utilizados para funcionalidades de transcripción en el sistema.

Para consultar la documentación específica:

📄  pps-transcripcion-main/README.md

# Tecnologías utilizadas
Frontend
Angular
TypeScript
HTML
CSS
Backend principal
Java
Spring Boot
Spring Security
JWT
Maven
Servicios complementarios
Python librería Whisper
Base de datos
PostgreSQL
Control de versiones
Git
GitHub

# Requisitos generales

Para trabajar con el proyecto se requieren las herramientas correspondientes a cada componente.

Frontend
Node.js
npm
Angular CLI
Backend Spring Boot
Java JDK
Maven
Backend Python
Python
pip
Entorno virtual (venv) recomendado
Base de datos
PostgreSQL

Los requisitos específicos y las versiones utilizadas se encuentran detallados en el README.md correspondiente a cada carpeta.

# Equipo de desarrollo

Proyecto desarrollado por:
Arias Noelí Gissel, Gallardo Martín Montiel.
