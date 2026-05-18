import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginModal } from '../components/LoginModal';
import { useAuth } from '../contexts/AuthContext';
import { sendContactMessage } from '../services/contactService';
import './HomePage.css';

const goodThingsPosts = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
        tag: 'function',
        title: 'Organize your daily job enhance your life performance',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&auto=format&fit=crop&q=80',
        tag: 'function',
        title: 'Mark one activity as done makes your brain understands the power of doing.',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80',
        tag: 'function',
        title: 'Careful with misunderstanding the difference between a list of things and a list of desires.',
    },
];

export function HomePage() {
    const navigate = useNavigate();
    const { isAuthenticated, user, logout } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const [contactForm, setContactForm] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [contactStatus, setContactStatus] = useState('');
    const [isSendingContact, setIsSendingContact] = useState(false);

    function handleContactChange(event) {
        const { name, value } = event.target;

        setContactForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    async function handleContactSubmit(event) {
        event.preventDefault();

        setContactStatus('');
        setIsSendingContact(true);

        try {
            await sendContactMessage(contactForm);

            setContactStatus('Message sent successfully.');
            setContactForm({
                name: '',
                email: '',
                phone: '',
                message: '',
            });
        } catch (error) {
            setContactStatus(error.message || 'Error sending message.');
        } finally {
            setIsSendingContact(false);
        }
    }

    function handleGoToTodoList() {
        if (isAuthenticated) {
            navigate('/todos');
            return;
        }

        setIsLoginModalOpen(true);
    }

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <>
            <main className="home-page">
                <section className="hero-section">
                    <header className="site-header">
                        <button
                            className="brand"
                            type="button"
                            onClick={() => navigate('/')}
                            aria-label="Go to home"
                        >
                            <span className="brand-symbol">&lt;</span>
                            <span>coopers</span>
                        </button>

                        {isAuthenticated ? (
                            <div className="header-user">
                                <span>{user?.name}</span>
                                <button type="button" className="login-button" onClick={handleLogout}>
                                    sair
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                className="login-button"
                                onClick={() => setIsLoginModalOpen(true)}
                            >
                                entrar
                            </button>
                        )}
                    </header>

                    <div className="hero-content">
                        <div className="hero-text">
                            <h1>
                                Organize
                                <span>your daily jobs</span>
                            </h1>

                            <p>The only way to get things done</p>

                            <button type="button" className="primary-button" onClick={handleGoToTodoList}>
                                Go to To-do list
                            </button>
                        </div>

                        <div className="hero-image-area" aria-hidden="true">
                            <div className="green-shape"></div>
                            <img
                                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=700&auto=format&fit=crop&q=80"
                                alt=""
                                className="hero-image"
                            />
                        </div>
                    </div>

                    <span className="scroll-indicator" aria-hidden="true">
                        ↓
                    </span>
                </section>

                <section className="todo-intro-section">
                    <h2>To-do List</h2>
                    <p>
                        Drag and drop to set your main priorities, check when done and create what´s new.
                    </p>
                </section>

                <section className="todo-preview-section" aria-label="To-do list preview">
                    <article className="preview-card preview-card-todo">
                        <div className="preview-card-bar orange"></div>

                        <h3>To-do</h3>
                        <p>
                            Take a breath.
                            <br />
                            Start doing.
                        </p>

                        <ul>
                            <li className="highlight">this is a new task</li>
                            <li>Develop the To-do list page</li>
                            <li>Create the drag-and-drop function</li>
                            <li>Add new tasks</li>
                            <li>Delete itens</li>
                            <li>Erase all</li>
                            <li>Checked item goes to Done list</li>
                            <li className="editing">Editing an item...</li>
                        </ul>

                        <button type="button">erase all</button>
                    </article>

                    <article className="preview-card preview-card-done">
                        <div className="preview-card-bar green"></div>

                        <h3>Done</h3>
                        <p>
                            Congratulations!
                            <br />
                            <strong>You have done 5 tasks</strong>
                        </p>

                        <ul>
                            <li>Get FTP credentials</li>
                            <li>Home Page Design</li>
                            <li>E-mail John about the deadline</li>
                            <li>Create a Google Drive folder</li>
                            <li>Send a gift to the client</li>
                        </ul>

                        <button type="button">erase all</button>
                    </article>
                </section>

                <section className="good-things-section">
                    <div className="good-things-background">
                        <h2>good things</h2>
                    </div>

                    <div className="good-things-carousel" aria-label="Good things posts carousel">
                        {goodThingsPosts.map((post) => (
                            <article className="post-card" key={post.id}>
                                <img src={post.image} alt="" loading="lazy" />

                                <div className="post-card-content">
                                    <span>{post.tag}</span>
                                    <h3>{post.title}</h3>
                                    <a href="#" onClick={(event) => event.preventDefault()}>
                                        read more
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>

                    <div className="carousel-dots" aria-hidden="true">
                        <span className="active"></span>
                        <span></span>
                        <span></span>
                    </div>
                </section>

                <section className="contact-section">
                    <div className="contact-avatar" aria-hidden="true"></div>

                    <form className="contact-card" onSubmit={handleContactSubmit}>
                        <div className="contact-title">
                            <span className="contact-icon">✉</span>
                            <h2>
                                GET IN
                                <br />
                                <strong>TOUCH</strong>
                            </h2>
                        </div>

                        <label htmlFor="contact-name">Your name</label>
                        <input
                            id="contact-name"
                            name="name"
                            value={contactForm.name}
                            onChange={handleContactChange}
                            placeholder="type your name here..."
                            required
                        />

                        <div className="contact-grid">
                            <div>
                                <label htmlFor="contact-email">Email*</label>
                                <input
                                    id="contact-email"
                                    name="email"
                                    type="email"
                                    value={contactForm.email}
                                    onChange={handleContactChange}
                                    placeholder="example@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="contact-phone">Telephone*</label>
                                <input
                                    id="contact-phone"
                                    name="phone"
                                    value={contactForm.phone}
                                    onChange={handleContactChange}
                                    placeholder="(  ) ____-____"
                                    required
                                />
                            </div>
                        </div>

                        <label htmlFor="contact-message">Message*</label>
                        <textarea
                            id="contact-message"
                            name="message"
                            value={contactForm.message}
                            onChange={handleContactChange}
                            placeholder="Type what you want to say to us"
                            required
                        ></textarea>

                        <button type="submit" disabled={isSendingContact}>
                            {isSendingContact ? 'SENDING...' : 'SEND NOW'}
                        </button>
                        {contactStatus && (
                            <p className="contact-status">
                                {contactStatus}
                            </p>
                        )}
                    </form>
                </section>
            </main>

            <footer className="site-footer">
                <p>Need help?</p>
                <strong>coopers@coopers.pro</strong>
                <small>© 2021 Coopers. All rights reserved.</small>
            </footer>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                onSuccess={() => navigate('/todos')}
            />
        </>
    );
}