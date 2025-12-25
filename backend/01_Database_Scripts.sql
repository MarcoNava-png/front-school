-- ============================================================================
-- SISTEMA DE COLEGIATURAS - Scripts de Base de Datos
-- Fase 1, 2 y 3: Recibos + Caja + Plantillas + Becas
-- ============================================================================

USE [NombreBaseDatos]; -- Cambiar por el nombre de tu BD
GO

-- ============================================================================
-- TABLA 1: CONCEPTOS DE PAGO (Catálogo)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[ConceptosPago]'))
BEGIN
    CREATE TABLE [dbo].[ConceptosPago] (
        [IdConceptoPago] INT PRIMARY KEY IDENTITY(1,1),
        [Clave] VARCHAR(20) UNIQUE NOT NULL,
        [Nombre] VARCHAR(100) NOT NULL,
        [Descripcion] VARCHAR(255) NULL,
        [EsActivo] BIT DEFAULT 1,
        [FechaCreacion] DATETIME DEFAULT GETDATE(),
        [FechaModificacion] DATETIME NULL
    );

    -- Datos iniciales
    INSERT INTO [dbo].[ConceptosPago] ([Clave], [Nombre], [Descripcion]) VALUES
    ('INSC', 'Inscripción', 'Pago de inscripción inicial'),
    ('COLE', 'Colegiatura', 'Pago mensual de colegiatura'),
    ('REIN', 'Reinscripción', 'Pago de reinscripción'),
    ('LAB', 'Laboratorio', 'Acceso a laboratorios'),
    ('SEGURO', 'Seguro Escolar', 'Seguro médico escolar'),
    ('EXAMEN', 'Examen Extraordinario', 'Pago por examen extraordinario'),
    ('TITULO', 'Trámites de Titulación', 'Trámites de titulación'),
    ('CRED', 'Credencial', 'Expedición de credencial'),
    ('CONST', 'Constancia', 'Expedición de constancia'),
    ('OTRO', 'Otro', 'Otros conceptos');

    PRINT 'Tabla ConceptosPago creada e inicializada';
END
GO

-- ============================================================================
-- TABLA 2: PLANTILLAS DE COBRO (Maestro)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PlantillasCobro]'))
BEGIN
    CREATE TABLE [dbo].[PlantillasCobro] (
        [IdPlantillaCobro] INT PRIMARY KEY IDENTITY(1,1),
        [NombrePlantilla] VARCHAR(200) NOT NULL,
        [IdPlanEstudios] INT NOT NULL,
        [NumeroCuatrimestre] INT NOT NULL,
        [IdPeriodoAcademico] INT NULL,
        [IdTurno] INT NULL,

        -- Estrategia de emisión
        [EstrategiaEmision] VARCHAR(20) NOT NULL DEFAULT 'INICIO_PERIODO',

        -- Configuración de recibos
        [NumeroRecibos] INT NOT NULL,
        [DiaVencimiento] INT NOT NULL,

        -- Control
        [EsActiva] BIT DEFAULT 1,
        [FechaCreacion] DATETIME DEFAULT GETDATE(),
        [FechaModificacion] DATETIME NULL,
        [IdUsuarioCreacion] INT NOT NULL,

        CONSTRAINT [FK_PlantillasCobro_PlanEstudios]
            FOREIGN KEY ([IdPlanEstudios]) REFERENCES [dbo].[PlanesEstudio]([IdPlanEstudios]),
        CONSTRAINT [CK_PlantillasCobro_EstrategiaEmision]
            CHECK ([EstrategiaEmision] IN ('INICIO_PERIODO', 'MENSUAL', 'PERSONALIZADO')),
        CONSTRAINT [CK_PlantillasCobro_DiaVencimiento]
            CHECK ([DiaVencimiento] BETWEEN 1 AND 31),
        CONSTRAINT [CK_PlantillasCobro_NumeroRecibos]
            CHECK ([NumeroRecibos] BETWEEN 1 AND 12)
    );

    -- Índices para búsqueda rápida
    CREATE NONCLUSTERED INDEX [IX_PlantillasCobro_Busqueda]
        ON [dbo].[PlantillasCobro]([IdPlanEstudios], [NumeroCuatrimestre], [IdPeriodoAcademico], [EsActiva]);

    PRINT 'Tabla PlantillasCobro creada';
END
GO

-- ============================================================================
-- TABLA 3: DETALLES DE PLANTILLA (Conceptos)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PlantillasCobroDetalles]'))
BEGIN
    CREATE TABLE [dbo].[PlantillasCobroDetalles] (
        [IdDetalleTempla] INT PRIMARY KEY IDENTITY(1,1),
        [IdPlantillaCobro] INT NOT NULL,
        [IdConceptoPago] INT NOT NULL,

        -- Monto y distribución
        [Monto] DECIMAL(10,2) NOT NULL,
        [Cantidad] INT DEFAULT 1,
        [Distribucion] VARCHAR(20) NOT NULL DEFAULT 'TODOS_LOS_RECIBOS',
        [NumeroRecibo] INT NULL,

        -- Orden de aparición
        [Orden] INT DEFAULT 1,

        CONSTRAINT [FK_PlantillasCobroDetalles_Plantilla]
            FOREIGN KEY ([IdPlantillaCobro]) REFERENCES [dbo].[PlantillasCobro]([IdPlantillaCobro]) ON DELETE CASCADE,
        CONSTRAINT [FK_PlantillasCobroDetalles_Concepto]
            FOREIGN KEY ([IdConceptoPago]) REFERENCES [dbo].[ConceptosPago]([IdConceptoPago]),
        CONSTRAINT [CK_PlantillasCobroDetalles_Distribucion]
            CHECK ([Distribucion] IN ('TODOS_LOS_RECIBOS', 'PRIMER_RECIBO', 'ULTIMO_RECIBO', 'RECIBO_ESPECIFICO'))
    );

    PRINT 'Tabla PlantillasCobroDetalles creada';
END
GO

-- ============================================================================
-- TABLA 4: RECIBOS (Maestro)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Recibos]'))
BEGIN
    CREATE TABLE [dbo].[Recibos] (
        [IdRecibo] INT PRIMARY KEY IDENTITY(1,1),
        [Folio] VARCHAR(50) UNIQUE NOT NULL,

        -- Estudiante y periodo
        [IdEstudiante] INT NOT NULL,
        [IdPeriodoAcademico] INT NOT NULL,
        [IdGrupo] INT NULL,

        -- Fechas
        [FechaEmision] DATETIME NOT NULL DEFAULT GETDATE(),
        [FechaVencimiento] DATE NOT NULL,

        -- Montos
        [Subtotal] DECIMAL(10,2) NOT NULL DEFAULT 0,
        [Descuento] DECIMAL(10,2) DEFAULT 0,
        [Total] DECIMAL(10,2) NOT NULL DEFAULT 0,
        [Saldo] DECIMAL(10,2) NOT NULL DEFAULT 0,

        -- Estado
        -- 0=Pendiente, 1=Pagado, 2=Parcial, 3=Vencido, 4=Cancelado, 5=Bonificado
        [Estatus] INT NOT NULL DEFAULT 0,
        [MotivoCancelacion] VARCHAR(500) NULL,

        -- Auditoría
        [FechaCreacion] DATETIME DEFAULT GETDATE(),
        [IdUsuarioCreacion] INT NOT NULL,
        [FechaCancelacion] DATETIME NULL,
        [IdUsuarioCancelacion] INT NULL,

        CONSTRAINT [FK_Recibos_Estudiante]
            FOREIGN KEY ([IdEstudiante]) REFERENCES [dbo].[Estudiantes]([IdEstudiante]),
        CONSTRAINT [FK_Recibos_PeriodoAcademico]
            FOREIGN KEY ([IdPeriodoAcademico]) REFERENCES [dbo].[PeriodoAcademico]([IdPeriodoAcademico]),
        CONSTRAINT [CK_Recibos_Estatus]
            CHECK ([Estatus] IN (0, 1, 2, 3, 4, 5))
    );

    -- Índices para optimización
    CREATE NONCLUSTERED INDEX [IX_Recibos_Estudiante]
        ON [dbo].[Recibos]([IdEstudiante], [IdPeriodoAcademico]);

    CREATE NONCLUSTERED INDEX [IX_Recibos_Folio]
        ON [dbo].[Recibos]([Folio]);

    CREATE NONCLUSTERED INDEX [IX_Recibos_Vencimiento]
        ON [dbo].[Recibos]([FechaVencimiento]);

    CREATE NONCLUSTERED INDEX [IX_Recibos_Estatus]
        ON [dbo].[Recibos]([Estatus]);

    PRINT 'Tabla Recibos creada';
END
GO

-- ============================================================================
-- TABLA 5: DETALLES DE RECIBOS (Conceptos)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[RecibosDetalles]'))
BEGIN
    CREATE TABLE [dbo].[RecibosDetalles] (
        [IdDetalleRecibo] INT PRIMARY KEY IDENTITY(1,1),
        [IdRecibo] INT NOT NULL,
        [IdConceptoPago] INT NOT NULL,

        -- Descripción y monto
        [Concepto] VARCHAR(200) NOT NULL,
        [Monto] DECIMAL(10,2) NOT NULL,

        -- Orden
        [Orden] INT DEFAULT 1,

        CONSTRAINT [FK_RecibosDetalles_Recibo]
            FOREIGN KEY ([IdRecibo]) REFERENCES [dbo].[Recibos]([IdRecibo]) ON DELETE CASCADE,
        CONSTRAINT [FK_RecibosDetalles_Concepto]
            FOREIGN KEY ([IdConceptoPago]) REFERENCES [dbo].[ConceptosPago]([IdConceptoPago])
    );

    CREATE NONCLUSTERED INDEX [IX_RecibosDetalles_Recibo]
        ON [dbo].[RecibosDetalles]([IdRecibo]);

    PRINT 'Tabla RecibosDetalles creada';
END
GO

-- ============================================================================
-- TABLA 6: MEDIOS DE PAGO
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MediosPago]'))
BEGIN
    CREATE TABLE [dbo].[MediosPago] (
        [IdMedioPago] INT PRIMARY KEY IDENTITY(1,1),
        [Nombre] VARCHAR(50) NOT NULL,
        [RequiereReferencia] BIT DEFAULT 0,
        [Activo] BIT DEFAULT 1
    );

    -- Datos iniciales
    INSERT INTO [dbo].[MediosPago] ([Nombre], [RequiereReferencia]) VALUES
    ('Efectivo', 0),
    ('Transferencia', 1),
    ('Tarjeta', 1),
    ('Cheque', 1);

    PRINT 'Tabla MediosPago creada e inicializada';
END
GO

-- ============================================================================
-- TABLA 7: PAGOS (Actualizar si existe o crear)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Pagos]'))
BEGIN
    CREATE TABLE [dbo].[Pagos] (
        [IdPago] INT PRIMARY KEY IDENTITY(1,1),
        [FolioPago] VARCHAR(50) UNIQUE NOT NULL,
        [FechaPagoUtc] DATETIME NOT NULL,
        [IdMedioPago] INT NOT NULL,
        [Monto] DECIMAL(10,2) NOT NULL,
        [Referencia] VARCHAR(100) NULL,
        [Notas] VARCHAR(500) NULL,

        -- Estado: 0=Confirmado, 1=Cancelado
        [Estatus] INT DEFAULT 0,

        -- Auditoría
        [FechaCreacion] DATETIME DEFAULT GETDATE(),
        [IdUsuarioCreacion] INT NOT NULL,

        CONSTRAINT [FK_Pagos_MedioPago]
            FOREIGN KEY ([IdMedioPago]) REFERENCES [dbo].[MediosPago]([IdMedioPago])
    );

    CREATE NONCLUSTERED INDEX [IX_Pagos_Folio]
        ON [dbo].[Pagos]([FolioPago]);

    CREATE NONCLUSTERED INDEX [IX_Pagos_Fecha]
        ON [dbo].[Pagos]([FechaPagoUtc]);

    PRINT 'Tabla Pagos creada';
END
GO

-- ============================================================================
-- TABLA 8: APLICACIÓN DE PAGOS (Relación Pagos-Recibos)
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[PagosAplicados]'))
BEGIN
    CREATE TABLE [dbo].[PagosAplicados] (
        [IdPagoAplicado] INT PRIMARY KEY IDENTITY(1,1),
        [IdPago] INT NOT NULL,
        [IdRecibo] INT NOT NULL,
        [MontoAplicado] DECIMAL(10,2) NOT NULL,
        [FechaAplicacion] DATETIME DEFAULT GETDATE(),

        CONSTRAINT [FK_PagosAplicados_Pago]
            FOREIGN KEY ([IdPago]) REFERENCES [dbo].[Pagos]([IdPago]),
        CONSTRAINT [FK_PagosAplicados_Recibo]
            FOREIGN KEY ([IdRecibo]) REFERENCES [dbo].[Recibos]([IdRecibo])
    );

    CREATE NONCLUSTERED INDEX [IX_PagosAplicados_Pago]
        ON [dbo].[PagosAplicados]([IdPago]);

    CREATE NONCLUSTERED INDEX [IX_PagosAplicados_Recibo]
        ON [dbo].[PagosAplicados]([IdRecibo]);

    PRINT 'Tabla PagosAplicados creada';
END
GO

-- ============================================================================
-- TABLA 9: BECAS DE ESTUDIANTES
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[BecasEstudiantes]'))
BEGIN
    CREATE TABLE [dbo].[BecasEstudiantes] (
        [IdBeca] INT PRIMARY KEY IDENTITY(1,1),
        [IdEstudiante] INT NOT NULL,

        -- Tipo de beca: PORCENTAJE (0-100) o MONTO_FIJO
        [TipoBeca] VARCHAR(20) NOT NULL,
        [Valor] DECIMAL(10,2) NOT NULL,

        -- Aplicación (NULL = aplica a todo)
        [IdConceptoPago] INT NULL,
        [IdPeriodoAcademico] INT NULL,

        -- Vigencia
        [Activa] BIT DEFAULT 1,
        [FechaInicio] DATE NOT NULL,
        [FechaFin] DATE NULL,

        -- Auditoría
        [FechaCreacion] DATETIME DEFAULT GETDATE(),
        [IdUsuarioCreacion] INT NOT NULL,
        [Observaciones] VARCHAR(500),

        CONSTRAINT [FK_BecasEstudiantes_Estudiante]
            FOREIGN KEY ([IdEstudiante]) REFERENCES [dbo].[Estudiantes]([IdEstudiante]),
        CONSTRAINT [FK_BecasEstudiantes_Concepto]
            FOREIGN KEY ([IdConceptoPago]) REFERENCES [dbo].[ConceptosPago]([IdConceptoPago]),
        CONSTRAINT [CK_BecasEstudiantes_TipoBeca]
            CHECK ([TipoBeca] IN ('PORCENTAJE', 'MONTO_FIJO'))
    );

    CREATE NONCLUSTERED INDEX [IX_BecasEstudiantes_Estudiante]
        ON [dbo].[BecasEstudiantes]([IdEstudiante], [Activa]);

    PRINT 'Tabla BecasEstudiantes creada';
END
GO

-- ============================================================================
-- TABLA 10: CORTES DE CAJA
-- ============================================================================
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[CortesCaja]'))
BEGIN
    CREATE TABLE [dbo].[CortesCaja] (
        [IdCorteCaja] INT PRIMARY KEY IDENTITY(1,1),
        [FolioCorteCaja] VARCHAR(50) UNIQUE NOT NULL,
        [FechaInicio] DATETIME NOT NULL,
        [FechaFin] DATETIME NOT NULL,

        -- Montos por medio de pago
        [TotalEfectivo] DECIMAL(10,2) DEFAULT 0,
        [TotalTransferencia] DECIMAL(10,2) DEFAULT 0,
        [TotalTarjeta] DECIMAL(10,2) DEFAULT 0,
        [TotalOtros] DECIMAL(10,2) DEFAULT 0,
        [TotalGeneral] DECIMAL(10,2) DEFAULT 0,

        -- Fondo inicial
        [MontoInicial] DECIMAL(10,2) DEFAULT 0,

        -- Control
        [Cerrado] BIT DEFAULT 0,
        [Observaciones] VARCHAR(500),

        -- Auditoría
        [FechaCreacion] DATETIME DEFAULT GETDATE(),
        [IdUsuarioCreacion] INT NOT NULL,

        CONSTRAINT [CK_CortesCaja_Fechas]
            CHECK ([FechaFin] >= [FechaInicio])
    );

    PRINT 'Tabla CortesCaja creada';
END
GO

-- ============================================================================
-- STORED PROCEDURE: Generar Folio de Recibo
-- ============================================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GenerarFolioRecibo]'))
    DROP PROCEDURE [dbo].[sp_GenerarFolioRecibo];
GO

CREATE PROCEDURE [dbo].[sp_GenerarFolioRecibo]
    @Folio VARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Anio INT = YEAR(GETDATE());
    DECLARE @UltimoNumero INT;

    -- Obtener el último número del año actual
    SELECT @UltimoNumero = ISNULL(MAX(CAST(RIGHT(Folio, 6) AS INT)), 0)
    FROM Recibos
    WHERE Folio LIKE 'REC-' + CAST(@Anio AS VARCHAR) + '-%';

    -- Incrementar y generar nuevo folio
    SET @UltimoNumero = @UltimoNumero + 1;
    SET @Folio = 'REC-' + CAST(@Anio AS VARCHAR) + '-' + RIGHT('000000' + CAST(@UltimoNumero AS VARCHAR), 6);
END
GO

-- ============================================================================
-- STORED PROCEDURE: Generar Folio de Pago
-- ============================================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GenerarFolioPago]'))
    DROP PROCEDURE [dbo].[sp_GenerarFolioPago];
GO

CREATE PROCEDURE [dbo].[sp_GenerarFolioPago]
    @Folio VARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Anio INT = YEAR(GETDATE());
    DECLARE @UltimoNumero INT;

    SELECT @UltimoNumero = ISNULL(MAX(CAST(RIGHT(FolioPago, 6) AS INT)), 0)
    FROM Pagos
    WHERE FolioPago LIKE 'PAG-' + CAST(@Anio AS VARCHAR) + '-%';

    SET @UltimoNumero = @UltimoNumero + 1;
    SET @Folio = 'PAG-' + CAST(@Anio AS VARCHAR) + '-' + RIGHT('000000' + CAST(@UltimoNumero AS VARCHAR), 6);
END
GO

-- ============================================================================
-- STORED PROCEDURE: Generar Folio de Corte
-- ============================================================================
IF EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[sp_GenerarFolioCorte]'))
    DROP PROCEDURE [dbo].[sp_GenerarFolioCorte];
GO

CREATE PROCEDURE [dbo].[sp_GenerarFolioCorte]
    @Folio VARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @Anio INT = YEAR(GETDATE());
    DECLARE @Mes INT = MONTH(GETDATE());
    DECLARE @UltimoNumero INT;

    SELECT @UltimoNumero = ISNULL(MAX(CAST(RIGHT(FolioCorteCaja, 3) AS INT)), 0)
    FROM CortesCaja
    WHERE FolioCorteCaja LIKE 'CORTE-' + CAST(@Anio AS VARCHAR) + '-' + RIGHT('00' + CAST(@Mes AS VARCHAR), 2) + '-%';

    SET @UltimoNumero = @UltimoNumero + 1;
    SET @Folio = 'CORTE-' + CAST(@Anio AS VARCHAR) + '-' +
                 RIGHT('00' + CAST(@Mes AS VARCHAR), 2) + '-' +
                 RIGHT('000' + CAST(@UltimoNumero AS VARCHAR), 3);
END
GO

PRINT '============================================';
PRINT 'TODOS LOS SCRIPTS SE EJECUTARON EXITOSAMENTE';
PRINT '============================================';
PRINT 'Tablas creadas: 10';
PRINT 'Stored Procedures creados: 3';
PRINT 'Índices creados: 12';
PRINT '============================================';
