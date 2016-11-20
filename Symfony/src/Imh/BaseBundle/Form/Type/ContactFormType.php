<?php

namespace Imh\BaseBundle\Form\Type;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints\NotBlank;

/**
 * Contact form.
 *
 * @author Gautier Jenkner <g.jenkner@gmail.com>
 */
class ContactFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('lastName', 'text', array(
                'label' => 'imh.base.contact.lastname',
                'required' => true,
                'constraints' => [
                    new NotBlank([
                        'message' => 'Ce champ est requis'
                    ])
                ]
            ))
            ->add('firstName', 'text', array(
                'label' => 'imh.base.contact.firstname',
                'required' => true,
                'constraints' => [
                    new NotBlank([
                        'message' => 'Ce champ est requis'
                    ])
                ]
            ))
            ->add('email', 'email', array(
                'label' => 'imh.base.contact.email',
                'required' => true,
                'constraints' => [
                    new NotBlank([
                        'message' => 'Ce champ est requis'
                    ])
                ]
            ))
            ->add('subject', 'text', array(
                'label' => 'imh.base.contact.subject',
                'required' => true,
                'constraints' => [
                    new NotBlank([
                        'message' => 'Ce champ est requis'
                    ])
                ]
            ))
            ->add('message', 'textarea', array(
                'label' => 'imh.base.contact.message',
                'trim' => false,
                'attr' => array('rows' => 10, 'cols' => 40),
                'required' => true,
                'constraints' => [
                    new NotBlank([
                        'message' => 'Ce champ est requis'
                    ])
                ]
            ))
            ->add('send', 'submit', array(
                'label' => 'imh.base.contact.send'
            ))
        ;
    }

    public function getName()
    {
        return 'imh_base_contact';
    }
}
