<?php

namespace Imh\BaseBundle\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class ContactController extends Controller
{
    public function detectDevice()
    {
        $mobileDetector = $this->get('mobile_detect.mobile_detector');
        $touchDevice = $mobileDetector->isMobile() || $mobileDetector->isTablet();

        return $touchDevice;
    }

    public function indexAction(Request $request)
    {
        $contactFormType = $this->get('imh_base.form.type.contact');
        $form = $this->createForm($contactFormType);

        $contactEmail = $this->container->getParameter('contact_email');

        if ($request->getMethod() == 'POST') {
            $form->handleRequest($request);

            if ($form->isValid()) {

                $data = $form->getData();

                $message = \Swift_Message::newInstance()
                    ->setSubject($data['subject'])
                    ->setFrom($data['email'])
                    ->setTo($contactEmail)
                    ->setBody($this->renderView('ImhBaseBundle:Contact:email.txt.twig',
                        array('lastName'  => $data['lastName'],
                              'firstName' => $data['firstName'],
                              'email'     => $data['email'],
                              'subject'   => $data['subject'],
                              'message'   => $data['message'])
                    ), 'text/plain');

                $this->get('mailer')->send($message);

                $this
                    ->get('session')
                    ->getFlashBag()
                    ->add('success', 'Votre message a été envoyé ! Merci !');

                //comment this line if you want the profiler to show sent mails
                return $this->redirect($this->generateUrl('imh_base_contact'));
            }
        }

        return $this->render('ImhBaseBundle:Page:contact.html.twig', array(
            'form' => $form->createView(),
            'isTouchDevice' => $this->detectDevice()
        ));
    }
}