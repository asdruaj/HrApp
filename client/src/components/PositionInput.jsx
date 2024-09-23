import { Select } from 'flowbite-react'
import React from 'react'

const PositionInput = ({ department, position, handleChange, ...rest }) => {
  return (
    <>

      <div className='row-start-8 col-start-1 row-span-1 col-span-5 md:mt-0 mt-1'>
        <label className='text-sm mb-2 dark:text-slate-200' htmlFor=''>Cargo</label>
        <Select name='position' value={position} onChange={handleChange} className='[&_select]:bg-white [&_select]:dark:bg-slate-500' {...rest}>
          <option value='' hidden>Seleccione una Opción...</option>
          {
                department === 'Operaciones Marítimas' &&
                  <>
                    <option value='Gerente'>Gerente</option>
                    <option value='Sptt. de Estrategia Operacional'>Sptt. de Estrategia Operacional</option>
                  </>
              }
          {
                department === 'Talento Humano' &&
                  <>
                    <option value='Gerente'>Gerente</option>
                    <option value='Coord. de Formación, Planificación y Gestión'>Coord. de Formación, Planificación y Gestión</option>
                    <option value='Coord. de Captación, DDO y Beneficios'>Coord. de Captación, DDO y Beneficios</option>
                    <option value='Coordinación de Relaciones Laborales(e)'>Coordinación de Relaciones Laborales(e)</option>
                    <option value='Coordinador de Nominas y Liquidación'>Coordinador de Nominas y Liquidación</option>
                    <option value='Coordinador de Nominas Marítimas'>Coordinador de Nominas Marítimas</option>
                    <option value='Analista de Formación'>Analista de Formación</option>
                    <option value='Analista de Beneficios'>Analista de Beneficios</option>
                    <option value='Analista de Gente de Mar'>Analista de Gente de Mar</option>
                    <option value='Supervisor de RRLL (PSF)'>Supervisor de RRLL (PSF)</option>
                    <option value='Supervisor de RRLL (PC)'>Supervisor de RRLL (PC)</option>
                    <option value='Inspector de RRLL'>Inspector de RRLL</option>
                  </>
              }

          {
                department === 'Servicios Logísticos' &&
                  <>
                    <option value='Gerente'>Gerente</option>
                    <option value='Sup. de Servicios Logísticos Administrativo'>Sup. de Servicios Logísticos Administrativo</option>
                    <option value='Supervisor de Servicios Logísticos en Obra'>Supervisor de Servicios Logísticos en Obra</option>
                    <option value='Supervisor de Flota'>Supervisor de Flota</option>
                    <option value='Chofer'>Chofer</option>
                    <option value='Recepcionista'>Recepcionista</option>
                    <option value='Asistente de Limpieza'>Asistente de Limpieza</option>
                    <option value='Asistente de Comedor'>Asistente de Comedor</option>
                    <option value='Asistente de Logística'>Asistente de Logística</option>
                    <option value='Logística T.'>Logística T.</option>
                  </>
              }
          {
                department === 'SIHO-A' &&
                  <>
                    <option value='Gerente'>Gerente</option>
                    <option value='Planificador'>Planificador</option>
                    <option value='Coord. de Ambiente'>Coord. de Ambiente</option>
                    <option value='Supervisor de Ambiente'>Supervisor de Ambiente</option>
                    <option value='Analista de Ambiente'>Analista de Ambiente</option>
                    <option value='Coord. SIHO PSF'>Coord. SIHO PSF</option>
                    <option value='Paramédico'>Paramédico</option>
                    <option value='Coord. de SIHO-A Adm.'>Coord. de SIHO-A Adm.</option>
                    <option value='Inspector SIHO'>Inspector SIHO</option>
                    <option value='Supervisor de Seguridad Marítima Naviera'>Supervisor de Seguridad Marítima Naviera</option>
                    <option value='Inspector de Seguridad Marítima'>Inspector de Seguridad Marítima</option>
                  </>
              }
          {
                department === 'Proyectos Tecnológicos' &&
                  <>
                    <option value='Gerente'>Gerente</option>
                  </>
              }
          {
                department === 'Ingeniería y Construcción' &&
                  <>
                    <option value='Gerente'>Gerente</option>
                    <option value='Especialista en Ingeniería'>Especialista en Ingeniería</option>
                    <option value='Ingeniero Mecánico'>Ingeniero Mecánico</option>
                    <option value='Ingeniero Civil'>Ingeniero Civil</option>
                    <option value='Ingeniero Electricista'>Ingeniero Electricista</option>
                    <option value='Ingeniero de Procesos'>Ingeniero de Procesos</option>
                    <option value='Proyectista'>Proyectista</option>
                    <option value='Inspector de Calidad'>Inspector de Calidad</option>
                    <option value='Inspector de Civil'>Ispector de Civil</option>
                    <option value='Inspector Mecánico'>Inspector Mecánico</option>
                    <option value='Inspector Electricista'>Inspector Electricista</option>
                    <option value='Control de Avance'>Control de Avance</option>
                  </>
              }
          {
                department === 'Operaciones Terrestres' &&
                  <>
                    <option value='Gerente'>Gerente</option>
                    <option value='Analista de Gestión'>Analista de Gestión</option>
                    <option value='Sptte. Operacional de Reclamo'>Sptte. Operacional de Reclamo</option>
                    <option value='Sptte. de Nuevos Desarrollos'>Sptte. de Nuevos Desarrollos</option>
                    <option value='Sptte. Operacional de Transporte R.V.'>Sptte. Operacional de Transporte R.V.</option>
                    <option value='Coordinador operacional de Reclamo'>Coordinador operacional de Reclamo</option>
                    <option value='Supervisor de Transporte R.V.'>Supervisor de Transporte R.V.</option>
                    <option value='Operador de Sala de Control'>Operador de Sala de Control</option>
                    <option value='Operador de Shiploader'>Operador de Shiploader</option>
                  </>
              }
          {
                department === 'Automatización, Informática y Telecomunicaciones' &&
                  <>
                    <option value='Gerente'>Gerente</option>
                    <option value='Sptte. IAC'>Sptte. IAC</option>
                    <option value='Sptte. IT'>Sptte. IT</option>
                    <option value='Coord. Rail Veyor'>Coord. Rail Veyor</option>
                    <option value='Supervisor Rail Veyor'>Supervisor Rail Veyor</option>
                    <option value='Coord. de Proyecto'>Coord. de Proyecto</option>
                    <option value='Supervisor de Proyecto'>Supervisor de Proyecto</option>
                    <option value='Técnico IAC'>Técnico IAC</option>
                    <option value='Coord. IT'>Coord. IT</option>
                    <option value='Técnico IT'>Técnico IT</option>
                  </>
              }
          {
                department === 'Mantenimiento' &&
                  <>
                    <option value='Gerente'>Gerente</option>
                    <option value='Sptte. de Mecánica'>Sptte. de Mecánica</option>
                    <option value='Sptte. de Equipos Móviles'>Sptte. de Equipos Móviles</option>
                    <option value='Sptte. de Electricidad'>Sptte. de Electricidad</option>
                    <option value='Sptte. de Confiabilidad Operacional'>Sptte. de Confiabilidad Operacional</option>
                    <option value='Coord. de Equipos Móviles'>Coord. de Equipos Móviles</option>
                    <option value='Coord. de Electricidad'>Coord. de Electricidad</option>
                    <option value='Coordinador de RV'>Coordinador de RV</option>
                    <option value='Coordinador Mecánico'>Coordinador Mecánico</option>
                    <option value='Inspector Mecánico'>Inspector Mecánico</option>
                    <option value='Inspector Eléctrico'>Inspector Eléctrico</option>
                    <option value='Supervisor Mayor'>Supervisor Mayor</option>
                    <option value='Mecánico'>Mecánico</option>
                    <option value='SISDEM-Fabricador de T.'>SISDEM-Fabricador de T.</option>
                    <option value='SISDEM-Chofer Esp. 30'>SISDEM-Chofer Esp. 30</option>
                    <option value='SISDEM-Chofer de 30'>SISDEM-Chofer de 30</option>
                    <option value='SISDEM-Mecánico Diésel'>SISDEM-Mecánico Diésel</option>
                    <option value='SISDEM-Obrero'>SISDEM-Obrero</option>
                    <option value='Técnico Mecánico'>Técnico Mecánico</option>
                    <option value='SISDEM-Ayudante Mec.'>SISDEM-Ayudante Mec.</option>
                    <option value='SISDEM-Obrero martiller'>SISDEM-Obrero martiller</option>
                    <option value='SISDEM-Mecánico Mont.'>SISDEM-Mecánico Mont.</option>
                    <option value='SISDEM-Mecánico C'>SISDEM-Mecánico C</option>
                    <option value='SISDEM-Chofer 750'>SISDEM-Chofer 750</option>
                  </>
              }
        </Select>
      </div>
    </>
  )
}

export default PositionInput
