// URL base del servidor
const BASE_URL = 'http://localhost:3000';

// Elementos del DOM
const formulario = document.getElementById('formularioActividad');
const tablaActividades = document.getElementById('cuerpoActividades');
const tablaLogs = document.getElementById('cuerpoLogs');

// Función para formatear fecha
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleString('es-ES');
}

// Cargar Actividades
async function cargarActividades() {
    try {
        const respuesta = await fetch(`${BASE_URL}/actividades`);
        const actividades = await respuesta.json();
        
        // Limpiar tabla
        tablaActividades.innerHTML = '';
        
        actividades.forEach(actividad => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${actividad.descripcion}</td>
                <td>${formatearFecha(actividad.fecha)}</td>
                <td>${actividad.estado}</td>
                <td>
                    <button onclick="editarActividad('${actividad._id}')">Editar</button>
                    <button onclick="eliminarActividad('${actividad._id}')">Eliminar</button>
                </td>
            `;
            tablaActividades.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar actividades:', error);
    }
}

// Cargar Logs
async function cargarLogs() {
    try {
        const respuesta = await fetch(`${BASE_URL}/logs`);
        const logs = await respuesta.json();
        
        // Limpiar tabla de logs
        tablaLogs.innerHTML = '';
        
        logs.forEach(log => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${log.accion}</td>
                <td>${log.entidad}</td>
                <td>${log.detalles}</td>
                <td>${formatearFecha(log.fecha)}</td>
            `;
            tablaLogs.appendChild(fila);
        });
    } catch (error) {
        console.error('Error al cargar logs:', error);
    }
}

// Crear Actividad
async function crearActividad(e) {
    e.preventDefault();
    const descripcion = document.getElementById('descripcion').value;
    const estado = document.getElementById('estado').value;

    try {
        const respuesta = await fetch(`${BASE_URL}/actividades`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                descripcion, 
                estado 
            })
        });

        if (respuesta.ok) {
            // Limpiar formulario
            formulario.reset();
            
            // Recargar actividades y logs
            await cargarActividades();
            await cargarLogs();
        }
    } catch (error) {
        console.error('Error al crear actividad:', error);
    }
}

// Editar Actividad
async function editarActividad(id) {
    const nuevaDescripcion = prompt('Ingrese la nueva descripción:');
    const nuevoEstado = prompt('Ingrese el nuevo estado (Activo/Pendiente/Completado):');

    if (nuevaDescripcion && nuevoEstado) {
        try {
            const respuesta = await fetch(`${BASE_URL}/actividades/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    descripcion: nuevaDescripcion,
                    estado: nuevoEstado 
                })
            });

            if (respuesta.ok) {
                await cargarActividades();
                await cargarLogs();
            }
        } catch (error) {
            console.error('Error al editar actividad:', error);
        }
    }
}

// Eliminar Actividad
async function eliminarActividad(id) {
    const confirmacion = confirm('¿Está seguro de eliminar esta actividad?');
    
    if (confirmacion) {
        try {
            const respuesta = await fetch(`${BASE_URL}/actividades/${id}`, {
                method: 'DELETE'
            });

            if (respuesta.ok) {
                await cargarActividades();
                await cargarLogs();
            }
        } catch (error) {
            console.error('Error al eliminar actividad:', error);
        }
    }
}

// Eventos
formulario.addEventListener('submit', crearActividad);

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarActividades();
    cargarLogs();
});