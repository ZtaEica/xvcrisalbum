import { useState, useEffect } from 'react';
import './App.css';
import { FiPlus, FiDownload, FiX, FiCamera } from 'react-icons/fi';

// --- CONFIGURACIÓN ---
const CLOUD_NAME = 'drbzyhoss'; // ¡PON TU CLOUD NAME AQUÍ!
const UPLOAD_PRESET = 'vsco_guest';
const TAG_NAME = 'album_quinces';

function App() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null); // Estado para el Lightbox

  const fetchMedia = async () => {
    try {
      const response = await fetch(
        `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${TAG_NAME}.json?v=${Date.now()}`
      );
      if (!response.ok) throw new Error('Error al cargar');
      const data = await response.json();
      setMedia(data.resources);
    } catch (error) {
      // CORRECCIÓN: Ahora usamos la variable 'error' imprimiéndola
      console.log('Esperando primeras fotos o error de red:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = () => {
    const myWidget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        tags: [TAG_NAME],
        sources: ['local', 'camera'],
        multiple: true,
        maxFileSize: 10000000,
        styles: {
          palette: {
            window: '#FFF',
            sourceBg: '#F4F4F5',
            action: '#000',
            link: '#000',
          },
        },
      },
      (error, result) => {
        if (!error && result && result.event === 'success') {
          setTimeout(() => fetchMedia(), 2500); // Pequeña espera para asegurar que procese
        }
      }
    );
    myWidget.open();
  };

  return (
    <div className="app">
      {/* HEADER FLOTANTE */}
      <header className="header">
        <div className="logo">XV CRISTIANA</div>
        <button
          className="upload-btn"
          onClick={handleUpload}
        >
          <FiPlus size={16} /> SUBIR
        </button>
      </header>

      {/* HERO / TÍTULO */}
      <section className="hero">
        <h1>El Álbum de mi Fiesta</h1>
        <p>
          ¡Gracias por acompañarme! Sube aquí tus fotos y videos favoritos de
          esta tarde mágica ✨.
        </p>
      </section>

      {/* GALERÍA */}
      <div className="gallery-container">
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40, opacity: 0.5 }}>
            Cargando...
          </div>
        ) : (
          <div className="masonry-grid">
            {media.map((item) => (
              <div
                key={item.public_id}
                className="photo-item"
                onClick={() => setSelectedImage(item)} // Abrir Lightbox
              >
                {item.format === 'mp4' || item.format === 'mov' ? (
                  <video
                    src={`https://res.cloudinary.com/${CLOUD_NAME}/video/upload/q_auto,vc_auto/${item.public_id}.${item.format}`}
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_600,q_auto,f_auto/${item.public_id}.${item.format}`}
                    alt="Momento"
                    loading="lazy"
                  />
                )}

                {/* Botón Descargar discreto */}
                <a
                  href={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/fl_attachment/${item.public_id}.${item.format}`}
                  className="download-badge"
                  onClick={(e) => e.stopPropagation()} // Evita que se abra el lightbox al descargar
                  download
                >
                  <FiDownload size={18} />
                </a>
              </div>
            ))}
          </div>
        )}

        {!loading && media.length === 0 && (
          <div style={{ textAlign: 'center', padding: 80, color: '#aaa' }}>
            <FiCamera
              size={48}
              style={{ marginBottom: 20 }}
            />
            <p>Aún no hay recuerdos.</p>
            <p style={{ fontSize: '0.9rem' }}>¡Sé el primero en compartir!</p>
          </div>
        )}
      </div>

      {/* LIGHTBOX (MODAL) */}
      {selectedImage && (
        <div
          className="lightbox-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <button className="close-btn">
            <FiX />
          </button>
          {selectedImage.format === 'mp4' || selectedImage.format === 'mov' ? (
            <video
              controls
              autoPlay
              className="lightbox-content"
              src={`https://res.cloudinary.com/${CLOUD_NAME}/video/upload/q_auto/${selectedImage.public_id}.${selectedImage.format}`}
            />
          ) : (
            <img
              className="lightbox-content"
              src={`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/${selectedImage.public_id}.${selectedImage.format}`}
              alt="Full screen"
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
