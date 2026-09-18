'use client';

import React, { useState } from 'react';
import {
    useForm,
    Controller,
    ControllerRenderProps,
    ControllerFieldState,
} from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { sendMail } from '@/lib/send-mail';
import { toast } from 'sonner';

const contactFormSchema = z.object({
    name: z.string().min(2, { message: 'Proszę wpisać swoje imię' }),
    email: z.string().email({ message: 'Proszę wpisać poprawny adres email' }),
    phone: z
        .string()
        .min(9, { message: 'Proszę wpisać poprawny numer telefonu' })
        .regex(/^\d+$/, { message: 'Numer telefonu może zawierać tylko cyfry' }),
});

export default function ContactForm() {
    const [submitted, setSubmitted] = useState(false); // Stan śledzący wysłanie formularza

    const form = useForm<z.infer<typeof contactFormSchema>>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
        },
    });

    const { control, handleSubmit, formState } = form;
    const isLoading = formState.isSubmitting;

    const onSubmit = async (values: z.infer<typeof contactFormSchema>) => {
        const mailText = `Imię: ${values.name}\nEmail: ${values.email}\nNumer telefonu: ${values.phone}`;
        const response = await sendMail({
            email: values.email,
            subject: 'Formularz ze strony „Kroki ku Aktywności - Podkarpackie Centrum Wsparcia OPT”',
            text: mailText,
        });
        if (response?.messageId) {
            toast.success('Formularz został pomyślnie wysłany.');
            setSubmitted(true); // Ustawiamy stan na true po wysłaniu
        } else {
            toast.error('Błąd podczas wysyłania emaila');
        }
    };

    return (
        <form className="p-4 lg:p-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
                <label htmlFor="name" className="form-label">
                    Imię i nazwisko:
                </label>
                <Controller
                    control={control}
                    name="name"
                    render={({
                        field,
                        fieldState,
                    }: {
                        field: ControllerRenderProps<z.infer<typeof contactFormSchema>, 'name'>;
                        fieldState: ControllerFieldState;
                    }) => (
                        <div>
                            <input
                                id="name"
                                type="text"
                                placeholder="Jan Kowalski"
                                {...field}
                                className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                                disabled={submitted} // Dezaktywujemy pole po wysłaniu
                            />
                            {fieldState.error && (
                                <div className="invalid-feedback">{fieldState.error.message}</div>
                            )}
                        </div>
                    )}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="email" className="form-label">
                    Adres email:
                </label>
                <Controller
                    control={control}
                    name="email"
                    render={({
                        field,
                        fieldState,
                    }: {
                        field: ControllerRenderProps<z.infer<typeof contactFormSchema>, 'email'>;
                        fieldState: ControllerFieldState;
                    }) => (
                        <div>
                            <input
                                id="email"
                                type="email"
                                placeholder="jan@example.com"
                                {...field}
                                className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                                disabled={submitted}
                            />
                            {fieldState.error && (
                                <div className="invalid-feedback">{fieldState.error.message}</div>
                            )}
                        </div>
                    )}
                />
            </div>

            <div className="mb-3">
                <label htmlFor="phone" className="form-label">
                    Numer telefonu:
                </label>
                <Controller
                    control={control}
                    name="phone"
                    render={({
                        field,
                        fieldState,
                    }: {
                        field: ControllerRenderProps<z.infer<typeof contactFormSchema>, 'phone'>;
                        fieldState: ControllerFieldState;
                    }) => (
                        <div>
                            <input
                                id="phone"
                                type="tel"
                                placeholder="123456789"
                                {...field}
                                className={`form-control ${fieldState.error ? 'is-invalid' : ''}`}
                                disabled={submitted}
                            />
                            {fieldState.error && (
                                <div className="invalid-feedback">{fieldState.error.message}</div>
                            )}
                        </div>
                    )}
                />
            </div>
            <div className="form-text mt-3">
                <p className="small text-muted">
                    Dane podane w formularzu będą przetwarzane w celu realizacji Twojego zgłoszenia,
                    zgodnie z jego zakresem, według zasad zawartych w dokumencie pod nazwą &nbsp;
                    <a className="link-primary" href="https://crse.org.pl/przetwarzanie_www.pdf" target="_blank" rel="noopener noreferrer">
                        Informacja o przetwarzaniu danych osobowych.
                    </a>
                </p>

            </div>
            <button
                type="submit"
                disabled={isLoading || submitted} // Dezaktywujemy przycisk po wysłaniu
                className="btn btn-primary"
            >
                {submitted
                    ? 'Dziękujemy za wiadomości, skontaktujemy się z Tobą.'
                    : isLoading
                        ? 'Wysyłanie....'
                        : 'Wyślij'}
            </button>
        </form>
    );
}
