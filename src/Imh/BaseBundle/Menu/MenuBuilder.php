<?php

/**
 * Menu Builder
 *
 * @author Gautier Jenkner
 */

namespace Imh\BaseBundle\Menu;

use Knp\Menu\FactoryInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\DependencyInjection\ContainerAware;
use Symfony\Bundle\TwigBundle\TwigEngine;


class MenuBuilder extends ContainerAware
{
    private $factory;
    private $engine;

    protected $container;

    /**
     * @param FactoryInterface $factory
     * @param TwigEngine $engine
     */
    public function __construct(FactoryInterface $factory, TwigEngine $engine)
    {
        $this->factory = $factory;
        $this->engine = $engine;
    }

    /**
     * @param ContainerInterface $container
     */
    public function setContainer(ContainerInterface $container = null)
    {
        $this->container = $container;
    }

    public function createMainMenu(Request $request)
    {
        $menu = $this->factory->createItem('root');

        $menu->addChild('imh.base.menu.home', array('route' => 'imh_base_homepage'))->setExtra('translation_domain', 'messages')->setAttribute('data-icon', 'fa fa-home fa-2x');
        $menu->addChild('imh.base.menu.biography', array('route' => 'imh_base_biography'))->setExtra('translation_domain', 'messages');
//        $menu->addChild('Events', array('route' => 'imh_base_events'));
        $menu->addChild('imh.base.menu.repertoire', array('route' => 'imh_base_repertoire'))->setExtra('translation_domain', 'messages');

        // Builder class extends ContainerAware class so we can access EntityManager
        $em = $this->container->get('doctrine.orm.entity_manager');
        $connection = $em->getConnection();

        // Select all ids from media__gallery
        $statement = $connection->prepare("
            SELECT mg.id
            FROM media__gallery mg
            ORDER BY mg.id ASC
        ");
        $statement->execute();
        $results = $statement->fetchAll();

        $errors = array_filter($results);

        if(!empty($errors)) { // if there is a gallery we show the menu
            $menu->addChild('imh.base.menu.gallery', array(
                'route' => 'sonata_media_gallery_view',
                'routeParameters' => array('id' => $results[0]['id']) // Shows first gallery
            ))->setExtra('translation_domain', 'messages');
        }

        $request_id = $request->attributes->get('id');
        $routeName = $request->get('_route');

        if($routeName === "sonata_media_gallery_view") {
            foreach ($results as $result) {
                if($result['id'] === $request_id) {
                    $menu['imh.base.menu.gallery']->setCurrent(true);
                }
            }
        }

        // Select all ids from media__media where provider_name = customYoutube
        $statement2 = $connection->prepare("
            SELECT mm.id
            FROM media__media mm
            WHERE provider_name = 'sonata.media.provider.custom'
            ORDER BY mm.id DESC
        ");
        $statement2->execute();
        $results2 = $statement2->fetchAll();

        $menu->addChild('imh.base.menu.video', array(
            'route' => 'sonata_media_view',
            'routeParameters' => array('id' => $results2[0]['id']) // Shows first video
        ))->setExtra('translation_domain', 'messages');

        if($routeName === "sonata_media_view") {
            foreach ($results2 as $result) {
                if($result['id'] === $request_id) {
                    $menu['imh.base.menu.video']->setCurrent(true);
                }
            }
        }

        $menu->addChild('imh.base.menu.contact', array('route' => 'imh_base_contact'))->setExtra('translation_domain', 'messages');

        return $menu;
    }

    public function createGalleryMenu(Request $request)
    {
        $galleries = $this->container->get('sonata.media.manager.gallery')->findBy(array(
            'enabled' => true
        ));

        $menu = $this->factory->createItem('root');

        $menu->addChild('_gallery', array(
            'label' => $this->engine->render('ApplicationSonataMediaBundle:Gallery:index.html.twig', array(
                    'galleries' => $galleries
                )),
            'extras' => array('safe_label' => true)
        ));

        $menu['_gallery']->setAttribute('class', 'gallery');

        return $menu;
    }
}