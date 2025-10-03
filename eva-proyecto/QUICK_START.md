# 🚀 INICIO RÁPIDO - PREPARACIÓN PARA PRODUCCIÓN

## ⚠️ ANTES DE EMPEZAR

**IMPORTANTE:** Este proyecto está listo para ser desplegado en producción. Sigue estos pasos en orden.

---

## 📋 PASO 1: HACER BACKUP (OBLIGATORIO)

```bash
cd eva-backend
php backup_database.php
```

**✅ Resultado:** Backup guardado en `storage/backups/backup_gestionthuv_FECHA.sql.zip`

**⚠️ DESCARGA Y GUARDA ESTE ARCHIVO EN UN LUGAR SEGURO**

---

## 📝 PASO 2: GENERAR MIGRACIONES

```bash
php generate_migrations.php
```

**✅ Resultado:** Migraciones creadas en `database/migrations/`

**📌 Revisa los archivos generados antes de usarlos en producción**

---

## 🔧 PASO 3: CONFIGURAR ENTORNO

### Backend

```bash
cd eva-backend
cp .env.production.example .env.production
# Edita .env.production con tus valores de producción
```

### Frontend

```bash
cd eva-frontend
cp .env.production.example .env.production
# Edita .env.production con tus valores de producción
```

---

## 📦 PASO 4: PREPARAR PARA DESPLIEGUE

### Opción A: Despliegue Manual

Sigue la guía completa en: **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)**

### Opción B: Despliegue Automático (En el servidor)

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 📚 ARCHIVOS IMPORTANTES

| Archivo | Descripción |
|---------|-------------|
| `DEPLOYMENT_GUIDE.md` | Guía completa de despliegue paso a paso |
| `backup_database.php` | Script para hacer backup de la BD |
| `generate_migrations.php` | Script para generar migraciones desde BD |
| `deploy.sh` | Script de despliegue automatizado |
| `.env.production.example` | Plantilla de configuración para producción |

---

## ✅ CHECKLIST PRE-DESPLIEGUE

- [ ] ✅ Backup de base de datos creado
- [ ] ✅ Migraciones generadas y revisadas
- [ ] ✅ Variables de entorno configuradas
- [ ] ✅ Servidor preparado con requisitos
- [ ] ✅ Dominio y DNS configurados
- [ ] ✅ SSL/HTTPS configurado

---

## 🆘 ¿NECESITAS AYUDA?

1. **Lee la guía completa:** [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
2. **Revisa los logs:** `tail -f eva-backend/storage/logs/laravel.log`
3. **Contacta soporte:** soporte@huv.gov.co

---

## 🎯 PRÓXIMOS PASOS

1. **Hacer backup** ✅
2. **Generar migraciones** ✅
3. **Configurar servidor** (Ver DEPLOYMENT_GUIDE.md)
4. **Subir código**
5. **Configurar Nginx**
6. **Configurar SSL**
7. **Probar aplicación**
8. **Poner en producción** 🚀

---

**¡El proyecto está listo para producción!** 🎉
